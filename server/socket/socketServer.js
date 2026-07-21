import {Server } from "socket.io";
import { jwtVerify } from "../config/jwt.js";
import { pool } from "../config/db.js";
import queue from "./queueClass.js"
import queueObj from "./queueObjClass.js"

const matchSize=4;

let finalMatches=[];

function penaltyRange(time){
    if(time<10000)return 50;
    if(time<20000)return 100;
    if(time<30000)return 200;
    if(time<45000)return 300;
    return 1000000;
}

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

function FindGameScore(player){
    const rankWeight = {
        "Iron": 100,
        "Bronze": 200,
        "Silver": 300,
        "Gold": 400,
        "Gold Nova": 450,
        "Platinum": 500,
        "Diamond": 650,
        "Ascendant": 800,
        "Master": 850,
        "Immortal": 950,
        "Radiant": 1000
    };

    const rankScore = rankWeight[player.rank] || 0;

    const winRate =
        player.games_played === 0
            ? 0
            : player.wins / player.games_played;

    return (
        rankScore +
        player.skill_rating +
        winRate * 300 +
        Math.min(player.games_played, 200) * 0.5
    );

}
function teamDivider(finalArray){
    if(finalArray[0].getQueueType()==1){
        return [
            [finalArray[0]],[ finalArray[2]],
            [finalArray[1]],[finalArray[3]]
        ];
    }

    if(finalArray[0].getQueueType()==2){
        return [
            [finalArray[0], finalArray[2]],
            [finalArray[1], finalArray[3]]
        ];
    }

    return [];
}

function startMatch(gameMatch,queueType,io){
    if(queueType==1){
        gameMatch.forEach((solo)=>{
            io.to(solo[0].getUserId()).emit("joined-match",gameMatch);
        })
    }
    if(queueType==2){
        gameMatch.forEach((duo)=>{
            io.to(duo[0].getUserId()).emit("joined-match",gameMatch);
            io.to(duo[1].getUserId()).emit("joined-match",gameMatch);
        })
    }
    if(queueType==4){
        gameMatch.forEach((squad)=>{
            io.to(squad[0].getUserId()).emit("joined-match",gameMatch);
            io.to(squad[1].getUserId()).emit("joined-match",gameMatch);
            io.to(squad[2].getUserId()).emit("joined-match",gameMatch);
            io.to(squad[3].getUserId()).emit("joined-match",gameMatch);
        })
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
            finalMatches=[];
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