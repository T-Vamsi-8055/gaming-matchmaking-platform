import { Server } from "socket.io";
import { pool } from "../config/db.js";

import queue from "./queueClass.js";
import queueObj from "./queueObjClass.js";
import partyClass from "./partyClass.js";
import {createPartyMatchmakingObject,getPartyLeader,getPartyMembers,findQueue} from "./socketServerFunctions.js/helperFns.js"
import { middleWareFn } from "./socketServerFunctions.js/middleWareFn.js";

import { FindGameScore, finalMatches,lengthOfGames,lengthOfQueueTypes } from "./GameLogic.js";
import { setIntervalFn } from "./socketServerFunctions.js/setIntervalFn.js";



const gamesArray = ["valorant", "cs2", "lol", "dota2", "apex"];

const queueTypeArray = [1, 2, 4];

// --------------------------------------------------
// MATCHMAKING QUEUE GRID
// --------------------------------------------------

const grid = Array.from({ length: lengthOfGames }, () =>
  Array.from({ length: lengthOfQueueTypes }, () => new queue("", 0)),
);

for (let i = 0; i < lengthOfGames; i++) {
  for (let j = 0; j < lengthOfQueueTypes; j++) {
    grid[i][j] = new queue(gamesArray[i], queueTypeArray[j]);
  }
}

// --------------------------------------------------
// ONLINE USERS
// --------------------------------------------------

const onlineUsersMap = new Map();



const livePartyState=new Map();
// --------------------------------------------------
// SOCKET INITIALIZATION
// --------------------------------------------------

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // --------------------------------------------------
  // SOCKET AUTHENTICATION
  // --------------------------------------------------

  io.use( middleWareFn);

  // --------------------------------------------------
  // MATCHMAKING SCANNER
  // --------------------------------------------------

  setInterval(async () => {setIntervalFn(grid,io)}, 3000);

  // --------------------------------------------------
  // CONNECTION
  // --------------------------------------------------

  io.on("connection", (socket) => {
    console.log("Socket connected with userId", socket.userId);
    
    onlineUsersMap.set(String(socket.userId), socket.id);

    /*
     * Every user gets a private room.
     *
     * This allows:
     *
     * io.to(userId).emit(...)
     *
     * to send a match notification
     * to that specific user.
     */

    socket.join(String(socket.userId));

    // --------------------------------------------------
    // DISCONNECT
    // --------------------------------------------------

    socket.on("disconnect", (reason) => {
      console.log(
        "Socket disconnected with userId",
        socket.userId,
        "Reason:",
        reason,
      );

      onlineUsersMap.delete(String(socket.userId));
      for(let i=0;i<grid.length;i++){
        for(let j=0;j<grid[i].length;j++){
          grid[i][j].deletePartyFromQueue(`user:${socket.userId}`);
        }
      }
    });

    // --------------------------------------------------
    // JOIN PARTY ROOM
    // --------------------------------------------------

    socket.on("join-party-room", async (partyId) => {
      try {
        
        if(!livePartyState.get(partyId))return;
        socket.join(`party:${partyId}`);
        if(!livePartyState.get(partyId).members.includes(socket.userId)){
        const newState=livePartyState.get(partyId);
if (!newState.members.includes(socket.userId)) newState.members.push(socket.userId);

        livePartyState.set(partyId,newState)
        }
        console.log(`User ${socket.userId} joined party ${partyId}`);

        socket.to(`party:${partyId}`).emit("new-member");
      } catch (error) {
        console.error("Join party room error:", error);
      }
    });
    socket.on("created-party",(partyId)=>{
        if (!livePartyState.has(partyId)) {
        livePartyState.set(partyId, { game: "", queueType: "", members: [socket.userId], readyMembers: [] , leaderId:socket.userId});
        }
    })
    // --------------------------------------------------
    // LEAVE PARTY ROOM
    // --------------------------------------------------

    socket.on("leave-party-room", async (partyId) => {
      if(!livePartyState.get(partyId))return;
      socket.leave(`party:${partyId}`);
      const state=livePartyState.get(partyId);
        const i = state.members.indexOf(socket.userId);
        if (i !== -1) {
          state.members.splice(i, 1);
          const response = await pool.query("select leader_id from parties where id=$1",[partyId]);
          state.leaderId=response.rows.leader_id;
          socket.to(`party:${partyId}`).emit("changed-party-state", state);
        }
        const j = state.readyMembers.indexOf(socket.userId);
        if (i !== -1) {
          state.readyMembers.splice(i, 1);
          
          socket.to(`party:${partyId}`).emit("changed-party-state", state);
        }
      console.log(`User ${socket.userId} left party ${partyId}`,livePartyState);
    });

    // --------------------------------------------------
    // PARTY CHAT
    // --------------------------------------------------

    socket.on("send-party-message", async ({ partyId, message }) => {
      try {
        if (!message || !message.trim()) {
          return;
        }

        

        const messageResult = await pool.query(
          `
                            INSERT INTO party_messages
                                (
                                    party_id,
                                    user_id,
                                    message
                                )
                            VALUES
                                ($1, $2, $3)
                            RETURNING
                                id,
                                party_id,
                                user_id,
                                message,
                                created_at
                            `,
          [partyId, socket.userId, message.trim()],
        );

        const savedMessage = messageResult.rows[0];

        const userResult = await pool.query(
          `
                            SELECT username
                            FROM users
                            WHERE id = $1
                            `,
          [socket.userId],
        );

        io.to(`party:${partyId}`).emit("party-message", {
          id: savedMessage.id,

          partyId: savedMessage.party_id,

          userId: savedMessage.user_id,

          username: userResult.rows[0]?.username || "Unknown",

          message: savedMessage.message,

          createdAt: savedMessage.created_at,
        });
      } catch (error) {
        console.error("Party message error:", error);
      }
    });

    

    socket.on("change-party-state", async ({ partyId, partyState }) => {
      try {
        console.log(partyState);

        if(livePartyState.has(partyId))livePartyState.set(partyId,partyState);
        else livePartyState.set(partyId,partyState);
        console.log(livePartyState);
        if(!socket.rooms.has(partyId.toString()))socket.join(`party:${partyId}`);


        io.to(`party:${partyId}`).emit("changed-party-state", partyState);
      } catch (error) {
        console.error("Change queue type error:", error);
      }
    });
    socket.on("open-party",(partyId)=>{
      
      if(livePartyState.has(partyId)){
        io.to(`party:${partyId}`).emit("changed-party-state", livePartyState.get(partyId));
      console.log( livePartyState);}
      else {
        livePartyState.set(partyId, { game: "", queueType: "", members: [socket.userId], readyMembers: [] ,leaderId:socket.userId});
      }

    })

    // --------------------------------------------------
    // PARTY MEMBER CLICKS START
    // --------------------------------------------------
    socket.on("join-user-queue",async (game,queueType)=>{
      try{
        const matchmakingQueue = findQueue(game, queueType,grid);
        console.log(matchmakingQueue);
          if (!matchmakingQueue) {
            return;
          }
          const userId=socket.userId;
          

          /*
           * Create ONE partyClass.
           *
           * Not one partyClass
           * per member.
           *
           * The partyClass contains
           * all queueObj objects.
           */
          const members=[{user_id:userId}];
          const partyObj = await createPartyMatchmakingObject(
            userId,
            game,
            queueType,
            members,
          );
          console.log(partyObj);
          livePartyState.set(`user:${userId}`,{game,queueType,readyMembers:[userId],members:[userId],leaderId:userId});
          matchmakingQueue.addPartyToQueue(partyObj);

          console.log(`User ${userId} entered matchmaking queue`, {
            game,
            queueType,
            members: members.length,
          });

          io.to(String(socket.userId)).emit("joined-user-queue", {
            userId,
            game,
            queueType,
          });
        }
      catch (error) {
        console.error("Party start error:", error);

        io.to(String(socket.userId)).emit("party-error", {
          message: "Unable to enter matchmaking.",
        });
      }
    })
    socket.on("party-click-start", async ({ partyId }) => {
      try {
        const state=livePartyState.get(partyId);
        const readyMembers=state.readyMembers.length;
        const totalMembers=state.members.length;
        console.log("in the party click start",livePartyState)


        io.to(`party:${partyId}`).emit("changed-party-state",state);

        /*
         * Everyone is ready.
         */

        if (readyMembers === totalMembers) {
          

          

          const game = livePartyState.get(partyId).game;

          const queueType = livePartyState.get(partyId).queueType;

          if (!game || !queueType) {
            io.to(`party:${partyId}`).emit("connect-error", {
              message:
                "Game and queue type must be selected before matchmaking.",
            });

            return;
          }

          const matchmakingQueue = findQueue(game, queueType,grid);
          console.log(matchmakingQueue);
          if (!matchmakingQueue) {
            return;
          }

          const members = state.members.map(mem=>({user_id:mem}));
          console.log(members)
          if (members.length === 0) {
            return;
          }

          /*
           * Create ONE partyClass.
           *
           * Not one partyClass
           * per member.
           *
           * The partyClass contains
           * all queueObj objects.
           */

          const partyObj = await createPartyMatchmakingObject(
            partyId,
            game,
            queueType,
            members,
          );

          matchmakingQueue.addPartyToQueue(partyObj);

          console.log(`Party ${partyId} entered matchmaking queue`, {
            game,
            queueType,
            members: members.length,
          });

          io.to(`party:${partyId}`).emit("party-ready-for-matchmaking", {
            partyId,
            game,
            queueType,
          });
        }
      } catch (error) {
        console.error("Party start error:", error);

        io.to(`party:${partyId}`).emit("party-error", {
          message: "Unable to enter matchmaking.",
        });
      }
    });

    // --------------------------------------------------
    // EXIT PARTY QUEUE
    // --------------------------------------------------
    socket.on("created-party",(partyId)=>{
        livePartyState.set(partyId, { game: "", queueType: "", members: [socket.userId], readyMembers: [] ,leaderId:socket.userId});

    })

    socket.on("exit-party-queue", async (partyId, game, queueType) => {
      try {
        console.log("party");

        const matchmakingQueue = findQueue(game, queueType,grid);
        console.log(game,queueType);
        if (!matchmakingQueue) {
          return;
        }
        console.log(partyId);
        if(partyId!=""){
        matchmakingQueue.deletePartyFromQueue(`party:${partyId}`);

        /*
         * Reset readiness.
         */
          livePartyState.get(partyId).readyMembers.length=0;
        const members = livePartyState.get(partyId).members;
        for (const member of members) {
            let userId=member;
            if(!typeof(member)==Number)userId=member.getUserId();
            io.to(String(userId)).emit("exit-party-queue", socket.userId);
          }
        }else{
          console.log("not party");
          matchmakingQueue.deletePartyFromQueue(socket.userId);
          livePartyState.delete(`user:${socket.userId}`);
          io.to(String(socket.userId)).emit("exit-party-queue", socket.userId);
        }
      } catch (error) {
        console.error("Exit party queue error:", error);
      }
    });
  });
}
