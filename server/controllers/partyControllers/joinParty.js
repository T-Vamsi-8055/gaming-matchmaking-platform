import { pool } from "../../config/db.js";


export const handleJoinParty = async (req, res) => {
    const client = await pool.connect();

    try {
        const { inviteCode } = req.body;
        const userId = req.user.id;

        if (!inviteCode) {
            return res.status(400).json({
                message: "Invite code is required"
            });
        }

        await client.query("BEGIN");

        const partyResult = await client.query(
            `SELECT *
             FROM parties
             WHERE invite_code = $1`,
            [inviteCode.toUpperCase()]
        );

        if (partyResult.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Party not found"
            });
        }

        const party = partyResult.rows[0];

        if (party.status !== "OPEN") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Party is closed"
            });
        }

        // Check if already a member
        const memberResult = await client.query(
            `SELECT 1
             FROM party_members
             WHERE party_id = $1 AND user_id = $2`,
            [party.id, userId]
        );

        if (memberResult.rowCount > 0) {
            await client.query("ROLLBACK");

            return res.status(200).json({
                message: "You are already in this party",
                partyId: party.id
            });
        }

        await client.query(
            `INSERT INTO party_members
             (party_id, user_id)
             VALUES ($1, $2)`,
            [party.id, userId]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "Joined party successfully",
            partyId: party.id
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Join party error:", error);

        return res.status(500).json({
            message: "Failed to join party"
        });

    } finally {
        client.release();
    }
};