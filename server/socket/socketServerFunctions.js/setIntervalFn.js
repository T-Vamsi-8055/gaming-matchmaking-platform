import {lengthOfGames,lengthOfQueueTypes,finalMatches} from "../GameLogic.js";
import { pool } from "../../config/db.js";

export async function setIntervalFn(grid,io){
    try {
      for (let i = 0; i < lengthOfGames; i++) {
    for (let j = 0; j < lengthOfQueueTypes; j++) {
      let noMoreMatches=false;
        const lateParties=grid[i][j].checkLateParties();
        for (const party of lateParties) {
            const users=party.getQueueObjArray();
            const partyId=party.getPartyId();
            grid[i][j].deletePartyFromQueue(partyId);
          for (const user of users ) {
            const userId=user.getUserId();
            io.to(String(userId)).emit("exit-party-queue", "");
          }
          }
        while(!noMoreMatches){
        const matchedParties = grid[i][j].checkFeasibleMatches();
        if (!matchedParties) {
            noMoreMatches=true;
            continue;
        }

        grid[i][j].deleteMatchPartiesFromQueue(matchedParties);

        finalMatches.push(matchedParties);
        console.log(finalMatches);

      }
    }
}   if (finalMatches.length === 0) {
        return;
      }

      const matchesToStart = [...finalMatches];
console.log(finalMatches);

      finalMatches.length = 0;
      for (const gameMatch of matchesToStart) {
        
        if (!gameMatch || gameMatch.length === 0) {
          continue;
        }
        const matchId = `match:${Date.now()}:${Math.random()
          .toString(36)
          .substring(2, 8)}`;
          const gamerIds=[];
          const userNames=[];
          const userRanks=[];
        for (const party of gameMatch) {
          if (!party || typeof party.getQueueObjArray !== "function") {
            continue;
          }

          const members = party.getQueueObjArray();
          
          for (const member of members) {
            try{
            
            const userId=member.getUserId();
            const response=await pool.query("select gamer_id from profiles where user_id=$1",[userId]);
                        console.log(response.rows);

            const response2=await pool.query("select username from users where id=$1",[userId]);
            const response3=await pool.query("select rank from mock_game_data where gamer_id=$1 limit 1",[response.rows[0].gamer_id]);
console.log(response2.rows);
console.log(response3.rows);
            gamerIds.push(response.rows[0].gamer_id);
            userNames.push(response2.rows[0].username);
            userRanks.push(response3.rows[0].rank);
            }catch(err){
              console.log(err);
            }
          }}
        for (const party of gameMatch) {
          if (!party || typeof party.getQueueObjArray !== "function") {
            continue;
          }

          const members = party.getQueueObjArray();
          try{

            
          for (const member of members) {
            try{
            
            io.to(String(member.getUserId())).emit("joined-match", {
              matchId,
              userRanks,
              gamerIds,
              userNames
            });
          }catch(err){
            console.log(err);
          }
          }
        } catch (error) {
              console.error("Matchmaking scanner error:", error);
          }
        }
      }
    } catch (error) {
      console.error("Matchmaking scanner error:", error);
    }
}