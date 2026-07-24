import { pool } from "../../config/db.js";

export const leaveParty = async (req, res) => {
    const client = await pool.connect();

    try {
        const { partyId } = req.params;
        const userId = req.user.id;

        await client.query("BEGIN");

        // Lock party row to avoid concurrent leadership changes
        const partyResult = await client.query(
            `SELECT leader_id, status
             FROM parties
             WHERE id = $1
             FOR UPDATE`,
            [partyId]
        );

        if (partyResult.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Party not found"
            });
        }

        const party = partyResult.rows[0];

        if (party.status === "CLOSED") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Party is already closed"
            });
        }

        // Check membership
        const memberResult = await client.query(
            `SELECT 1
             FROM party_members
             WHERE party_id = $1
             AND user_id = $2`,
            [partyId, userId]
        );

        if (memberResult.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "You are not a member of this party"
            });
        }

        // Remove member
        await client.query(
            `DELETE FROM party_members
             WHERE party_id = $1
             AND user_id = $2`,
            [partyId, userId]
        );

        // Normal member leaves
        if (Number(party.leader_id) !== Number(userId)) {
            await client.query("COMMIT");

            return res.status(200).json({
                message: "Left party successfully"
            });
        }

        // Leader left.
        // Find the oldest remaining member.
        const nextLeaderResult = await client.query(
            `SELECT user_id
             FROM party_members
             WHERE party_id = $1
             ORDER BY joined_at ASC
             LIMIT 1`,
            [partyId]
        );

        // Nobody remains.
        if (nextLeaderResult.rowCount === 0) {
            await client.query(
                `UPDATE parties
                 SET status = 'CLOSED'
                 WHERE id = $1`,
                [partyId]
            );

            await client.query("COMMIT");

            return res.status(200).json({
                message: "Left party and party was closed"
            });
        }

        // Transfer leadership
        const newLeaderId =
            nextLeaderResult.rows[0].user_id;

        await client.query(
            `UPDATE parties
             SET leader_id = $1
             WHERE id = $2`,
            [newLeaderId, partyId]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "Left party successfully",
            newLeaderId
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Leave party error:",
            error
        );

        return res.status(500).json({
            message: "Failed to leave party"
        });

    } finally {
        client.release();
    }
};