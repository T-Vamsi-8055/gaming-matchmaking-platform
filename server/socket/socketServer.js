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

  setInterval(() => {setIntervalFn(grid,io)}, 3000);

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
    });

    // --------------------------------------------------
    // JOIN PARTY ROOM
    // --------------------------------------------------

    socket.on("join-party-room", async (partyId) => {
      try {
        

        socket.join(`party:${partyId}`);
        if(!livePartyState.get(partyId).members.includes(socket.userId)){
        const newState=livePartyState.get(partyId).members.push(socket.userId);

        livePartyState.set(partyId,newState)
        }
        console.log(`User ${socket.userId} joined party ${partyId}`);

        socket.to(`party:${partyId}`).emit("new-member");
      } catch (error) {
        console.error("Join party room error:", error);
      }
    });
    socket.on("created-party",(data)=>{
        if (!livePartyState.has(partyId)) {
        livePartyState.set(partyId, { game: "", queueType: "", members: [], readyMembers: [] });
        }
    })
    // --------------------------------------------------
    // LEAVE PARTY ROOM
    // --------------------------------------------------

    socket.on("leave-party-room", (partyId) => {
      socket.leave(`party:${partyId}`);
      const state=livePartyState.get(partyId);
        if(state.members.includes(socket.userId)){
            const removeIndex=state.members.indexOf(socket.userId);
        const newState=state.splice(removeIndex,1);

        livePartyState.set(partyId,newState)
        socket.to(`party:${partyId}`).emit("changed-party-state",state);

        }
      console.log(`User ${socket.userId} left party ${partyId}`);
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
        
        livePartyState.set(partyId,partyState);
        
        

        io.to(`party:${partyId}`).emit("changed-party-state", partyState);
      } catch (error) {
        console.error("Change queue type error:", error);
      }
    });

    // --------------------------------------------------
    // PARTY MEMBER CLICKS START
    // --------------------------------------------------

    socket.on("party-click-start", async ({ partyId }) => {
      try {
        const state=livePartyState.get(partyId)
        if(state.readyMembers.includes(socket.userId))return;
        state.readyMembers.push(socket.userId);
        const readyMembers=state.readyUsers.length;
        const totalMembers=state.members.length;
        


        io.to(`party:${partyId}`).emit("changed-party-state",state);

        /*
         * Everyone is ready.
         */

        if (readyMembers === totalMembers) {
          

          

          const game = livePartyState.game;

          const queueType = livePartyState.queueType;

          if (!game || !queueType) {
            io.to(`party:${partyId}`).emit("connect_error", {
              message:
                "Game and queue type must be selected before matchmaking.",
            });

            return;
          }

          const matchmakingQueue = findQueue(game, queueType,grid);

          if (!matchmakingQueue) {
            return;
          }

          const members = state.members;

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

    socket.on("exit-party-queue", async ({ partyId, game, queueType }) => {
      try {
        

        const matchmakingQueue = findQueue(game, queueType,grid);

        if (!matchmakingQueue) {
          return;
        }

        matchmakingQueue.deletePartyFromQueue(`party:${partyId}`);

        /*
         * Reset readiness.
         */

        const members = livePartyState.get(partyId).members

        for (const member of members) {
            io.to(String(member.getUserId())).emit("exit-party-queue", socket.userId);
          }

      } catch (error) {
        console.error("Exit party queue error:", error);
      }
    });
  });
}
