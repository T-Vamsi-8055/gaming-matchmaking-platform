
import { pool } from "../../config/db.js";

export const leaveParty = async (req, res) => {
    const client = await pool.connect();

    try {
        const { partyId } = req.params;
        const userId = req.user.userId;

        await client.query("BEGIN");

        const partyResult = await client.query(
            `SELECT leader_id
             FROM parties
             WHERE id = $1`,
            [partyId]
        );

        if (partyResult.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Party not found"
            });
        }

        const party = partyResult.rows[0];

        // Leader cannot leave without handling leadership transfer
        if (Number(party.leader_id) === Number(userId)) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Party leader cannot leave. Transfer leadership or delete the party."
            });
        }

        const result = await client.query(
            `DELETE FROM party_members
             WHERE party_id = $1 AND user_id = $2`,
            [partyId, userId]
        );

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "You are not a member of this party"
            });
        }

        await client.query("COMMIT");

        return res.status(200).json({
            message: "Left party successfully"
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Leave party error:", error);

        return res.status(500).json({
            message: "Failed to leave party"
        });

    } finally {
        client.release();
    }
};