import {lengthOfGames,lengthOfQueueTypes,finalMatches} from "../GameLogic.js";

export function setIntervalFn(grid,io){
  console.log(grid[0][0])
    try {
      for (let i = 0; i < lengthOfGames; i++) {
    for (let j = 0; j < lengthOfQueueTypes; j++) {
      let noMoreMatches=false;
        const lateParties=grid[i][j].checkLateParties();
        console.log(lateParties);
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
      }
    }
}   if (finalMatches.length === 0) {
        return;
      }

      const matchesToStart = [...finalMatches];

      finalMatches.length = 0;

      for (const gameMatch of matchesToStart) {
        if (!gameMatch || gameMatch.length === 0) {
          continue;
        }

        /*
         * gameMatch contains partyClass
         * objects.
         *
         * Example:
         *
         * [
         *   partyClass,
         *   partyClass,
         *   partyClass
         * ]
         *
         * We do NOT divide teams here.
         *
         * The matched parties are sent
         * to a match room.
         */

        const matchId = `match:${Date.now()}:${Math.random()
          .toString(36)
          .substring(2, 8)}`;

        for (const party of gameMatch) {
          if (!party || typeof party.getQueueObjArray !== "function") {
            continue;
          }

          const members = party.getQueueObjArray();

          for (const member of members) {
            io.to(String(member.getUserId())).emit("joined-match", {
              matchId,
              gameMatch,
            });
          }
        }
      }
    } catch (error) {
      console.error("Matchmaking scanner error:", error);
    }
}