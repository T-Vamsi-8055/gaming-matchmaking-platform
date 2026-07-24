import {Server } from "socket.io";
import { jwtVerify } from "../config/jwt.js";
import { pool } from "../config/db.js";
import queue from "./queueClass.js"
import queueObj from "./queueObjClass.js"
import { startMatch,FindGameScore,teamDivider } from "./GameLogic.js";
import { finalMatches } from "./GameLogic.js";
import partyClass from "./partyClass.js";



const lengthOfGames=5;
const lengthOfQueueTypes=3;

const grid = Array.from({ length: lengthOfGames }, () =>
    Array.from({ length: lengthOfQueueTypes }, () => new queue("", 0))
);

const gamesArray=["valorant","cs2","lol","dota2","apex"];
const queueTypeArray=[1,2,4]
for(let i=0;i<lengthOfGames;i++){
    
    for(let j=0;j<lengthOfQueueTypes;j++){
    grid[i][j]=new queue(gamesArray[i],queueTypeArray[j]);
    }
    
}



const onlineUsersMap=new Map();

export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });
    
    io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("No token"));
    }

    const decoded = jwtVerify(token);

    if (!decoded) {
        return next(new Error("Invalid token"));
    }

    socket.userId = decoded.id;
    next();
});
    setInterval(()=>{
            for(let i=0;i<lengthOfGames;i++){
                for(let j=0;j<lengthOfQueueTypes;j++){
                    grid[i][j].checkBestMatch()
                }
            }
            finalMatches.forEach((gameMatch)=>{
                const queueType=gameMatch[0][0].getQueueType();
                startMatch(gameMatch,queueType,io);
                
            })
            finalMatches.length=0;
        },3000)
    io.on("connection",(socket)=>{
        console.log("Socket connected with userId",socket.userId);
        onlineUsersMap.set(socket.userId,socket.id);
        socket.join(socket.userId)
        socket.on("disconnect",(reason)=>{
        console.log("Socket disconnected with userId",socket.userId,"Reason:",reason);
        onlineUsersMap.delete(socket.userId)
        socket.leave(socket.userId);
        })
        
        socket.on("join-queue",async (game,queueType)=>{
            let found = false;
            
            try{
            for(let i=0;i<lengthOfGames && !found;i++){
                for(let j=0;j<lengthOfQueueTypes;j++){
                    if(grid[i][j].getGameName()==game && grid[i][j].getQueueType()==queueType){

                        let newQueueObj=new queueObj();
                        newQueueObj.setJoinTime(Date.now());
                        const gamerId=await pool.query("select gamer_id from profiles where user_id=$1",[socket.userId]);
                        const gameDetails=await pool.query("select * from mock_game_data where gamer_id=$1 and game_name=$2",[gamerId.rows[0].gamer_id,game]);
                        newQueueObj.setGameScore(FindGameScore(gameDetails.rows[0]));
                        newQueueObj.setUserId(socket.userId);
                        newQueueObj.setQueueType(queueType);
                        const singlePartyObj=new partyClass(`user ${socket.userId}`,queueType,[newQueueObj]);
                        grid[i][j].addPartyToQueue(singlePartyObj);
                        found=true;
                        console.log("Socket joined with userId",socket.userId,game,queueType);

                        break;
                    }
                }
            }
        }catch(err){console.log(err)}
        })
        socket.on("join-queue-party",async (game,queueType)=>{
            let found = false;

            try{
            for(let i=0;i<lengthOfGames && !found;i++){
                for(let j=0;j<lengthOfQueueTypes;j++){
                    if(grid[i][j].getGameName()==game && grid[i][j].getQueueType()==queueType){

                        let newQueueObj=new queueObj();
                        newQueueObj.setJoinTime(Date.now());
                        const gamerId=await pool.query("select gamer_id from profiles where user_id=$1",[socket.userId]);
                        const gameDetails=await pool.query("select * from mock_game_data where gamer_id=$1 and game_name=$2",[gamerId.rows[0].gamer_id,game]);
                        newQueueObj.setGameScore(FindGameScore(gameDetails.rows[0]));
                        newQueueObj.setUserId(socket.userId);
                        newQueueObj.setQueueType(queueType);
                        grid[i][j].addUserToQueue(newQueueObj);
                        found=true;
                        console.log("Socket joined with userId",socket.userId,game,queueType);

                        break;
                    }
                }
            }
        }catch(err){console.log(err)}
        })

        socket.on("exit-queue",(game,queueType)=>{

            for(let i=0;i<lengthOfGames;i++){
                for(let j=0;j<lengthOfQueueTypes;j++){
                    if(grid[i][j].getGameName()==game && grid[i][j].getQueueType()==queueType){
                        grid[i][j].deleteUserFromQueue(socket.userId);
                        break;
                    }
                }
            }
        })

        
        socket.on("join-party-room", (partyId) => {
            socket.join(`party:${partyId}`);

            console.log(
                `User ${socket.userId} joined party ${partyId}`
            );
        });

        socket.on("leave-party-room", (partyId) => {
            socket.leave(`party:${partyId}`);

            console.log(
                `User ${socket.userId} left party ${partyId}`
            );
        });

        socket.on("send-party-message", async ({ partyId, message }) => {
            console.log(
            "SEND PARTY MESSAGE EVENT RECEIVED"
        );

        console.log(
            "User:",
            socket.userId
        );

        console.log(
            "Party:",
            partyId
        );

        console.log(
            "Message:",
            message
        );
            try {
                if (!message || !message.trim()) {
                    return;
                }

                // Check whether the user actually belongs to this party
                const memberResult = await pool.query(
                    `SELECT 1
                    FROM party_members
                    WHERE party_id = $1
                    AND user_id = $2`,
                    [partyId, socket.userId]
                );

                if (memberResult.rowCount === 0) {
                    console.log(
                        `User ${socket.userId} is not a member of party ${partyId}`
                    );

                    return;
                }

                // Save message to database
                const messageResult = await pool.query(
                    `INSERT INTO party_messages
                        (party_id, user_id, message)
                    VALUES ($1, $2, $3)
                    RETURNING id, party_id, user_id, message, created_at`,
                    [
                        partyId,
                        socket.userId,
                        message.trim()
                    ]
                );

                const savedMessage = messageResult.rows[0];

                // Get username
                const userResult = await pool.query(
                    `SELECT username
                    FROM users
                    WHERE id = $1`,
                    [socket.userId]
                );

                // Broadcast saved message
                io.to(`party:${partyId}`).emit(
                    "party-message",
                    {
                        id: savedMessage.id,
                        partyId: savedMessage.party_id,
                        userId: savedMessage.user_id,
                        username: userResult.rows[0].username,
                        message: savedMessage.message,
                        createdAt: savedMessage.created_at
                    }
                );

            } catch (error) {
                console.error(
                    "Party message error:",
                    error
                );
            }
        });



    })
    
}