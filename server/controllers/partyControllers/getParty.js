
import { pool } from "../../config/db.js";

export const getParty = async (req, res) => {
    try {
        const partyId  = req.params.id;

        console.log(partyId);

        const result = await pool.query(
            `SELECT
                p.id,
                p.party_name,
                p.invite_code,
                p.leader_id,
                p.visibility,
                p.status,
                p.created_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'userId', u.id,
                            'username', u.username
                        )
                    ) FILTER (WHERE u.id IS NOT NULL),
                    '[]'
                ) AS members
            FROM parties p
            LEFT JOIN party_members pm
                ON p.id = pm.party_id
            LEFT JOIN users u
                ON pm.user_id = u.id
            WHERE p.id = $1
            GROUP BY p.id`,
            [partyId]
        );

        const messageResult = await pool.query(
            `SELECT
                pm.id,
                pm.message,
                pm.created_at,
                u.id AS user_id,
                u.username
            FROM party_messages pm
            JOIN users u
                ON pm.user_id = u.id
            WHERE pm.party_id = $1
            ORDER BY pm.created_at ASC`,
            [partyId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Party not found"
            });
        }

        return res.status(200).json({
            party: result.rows[0],
            messages: messageResult.rows
        });

    } catch (error) {
        console.error("Get party error:", error);

        return res.status(500).json({
            message: "Failed to get party"
        });
    }
};