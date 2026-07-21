import {Server } from "socket.io";
import { jwtVerify } from "../config/jwt.js";
import { pool } from "../config/db.js";
import queue from "./queueClass.js"
import queueObj from "./queueObjClass.js"
import { startMatch,FindGameScore,teamDivider } from "./GameLogic.js";
import { finalMatches } from "./GameLogic.js";




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

    })
    
}