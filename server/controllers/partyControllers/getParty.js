
import { pool } from "../../config/db.js";

export const getParty = async (req, res) => {
    try {
        const { partyId } = req.params;

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

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Party not found"
            });
        }

        return res.status(200).json({
            party: result.rows[0]
        });

    } catch (error) {
        console.error("Get party error:", error);

        return res.status(500).json({
            message: "Failed to get party"
        });
    }
};