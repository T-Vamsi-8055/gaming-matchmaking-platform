import {lengthOfGames,lengthOfQueueTypes} from "../GameLogic.js"
import { pool } from "../../config/db.js";

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

export function findQueue(game, queueType,grid) {
  for (let i = 0; i < lengthOfGames; i++) {
    for (let j = 0; j < lengthOfQueueTypes; j++) {
      if (
        grid[i][j].getGameName() === game &&
        Number(grid[i][j].getQueueType()) === Number(queueType)
      ) {
        return grid[i][j];
      }
    }
  }

  return null;
}

export async function getPartyMembers(partyId) {
  const result = await pool.query(
    `SELECT pm.user_id,u.username FROM party_members pm    JOIN users u ON u.id = pm.user_id    WHERE pm.party_id = $1    ORDER BY pm.user_id`,
    [partyId],
  );
  return result.rows;
}



export async function getPartyLeader(partyId) {
  const result = await pool.query(
    `         SELECT leader_id
        FROM parties
        WHERE id = $1
        `,
    [partyId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0].leader_id;
}

export async function createPartyMatchmakingObject(partyId, game, queueType, members) {
  const queueObjects = [];

  for (const member of members) {
    const profileResult = await pool.query(
      `
            SELECT gamer_id
            FROM profiles
            WHERE user_id = $1
            `,
      [member.user_id],
    );

    if (profileResult.rowCount === 0) {
      throw new Error(`Profile not found for user ${member.user_id}`);
    }

    const gamerId = profileResult.rows[0].gamer_id;

    const gameResult = await pool.query(
      `
            SELECT *
            FROM mock_game_data
            WHERE gamer_id = $1
            AND game_name = $2
            `,
      [gamerId, game],
    );

    if (gameResult.rowCount === 0) {
      throw new Error(`Game data not found for user ${member.user_id}`);
    }

    const gameData = gameResult.rows[0];

    const newQueueObj = new queueObj();

    newQueueObj.setJoinTime(Date.now());

    newQueueObj.setGameScore(FindGameScore(gameData));

    newQueueObj.setUserId(member.user_id);

    newQueueObj.setQueueType(Number(queueType));

    queueObjects.push(newQueueObj);
  }

  return new partyClass(
    `party:${partyId}`,
    Number(queueType),
    queueObjects,
    Date.now(),
  );
}