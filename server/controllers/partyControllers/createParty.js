import { pool } from "../../config/db.js";
import crypto from "crypto";

export const handleCreateParty = async (req, res) => {
    const client = await pool.connect();

    try {
        const { partyName, visibility = "PUBLIC" } = req.body;
        const userId = req.user.id;

        if (!partyName || partyName.trim().length === 0) {
            return res.status(400).json({
                message: "Party name is required"
            });
        }

        if (!["PUBLIC", "PRIVATE"].includes(visibility)) {
            return res.status(400).json({
                message: "Invalid visibility"
            });
        }

        await client.query("BEGIN");

        // Generate unique 8-character invite code
        let inviteCode;
        let exists = true;

        while (exists) {
            inviteCode = crypto
                .randomBytes(4)
                .toString("hex")
                .toUpperCase();

            const result = await client.query(
                "SELECT 1 FROM parties WHERE invite_code = $1",
                [inviteCode]
            );

            exists = result.rowCount > 0;
        }

        const partyResult = await client.query(
            `INSERT INTO parties
            (party_name, invite_code, leader_id, visibility, status)
            VALUES ($1, $2, $3, $4, 'OPEN')
            RETURNING *`,
            [partyName.trim(), inviteCode, userId, visibility]
        );

        const party = partyResult.rows[0];

        // Creator automatically becomes first member
        await client.query(
            `INSERT INTO party_members
            (party_id, user_id)
            VALUES ($1, $2)`,
            [party.id, userId]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message: "Party created successfully",
            party
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Create party error:", error);

        return res.status(500).json({
            message: "Failed to create party"
        });

    } finally {
        client.release();
    }
};
