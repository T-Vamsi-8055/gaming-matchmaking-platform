import { pool } from "../../config/db.js";

export const getMyParties = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                p.id,
                p.party_name,
                p.invite_code,
                p.leader_id,
                p.visibility,
                p.status,
                p.created_at,
                COUNT(pm2.user_id)::int AS member_count
            FROM parties p
            JOIN party_members pm
                ON p.id = pm.party_id
            LEFT JOIN party_members pm2
                ON p.id = pm2.party_id
            WHERE pm.user_id = $1
            GROUP BY p.id
            ORDER BY p.created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            parties: result.rows
        });

    } catch (error) {
        console.error("Get my parties error:", error);

        return res.status(500).json({
            message: "Failed to fetch parties"
        });
    }
};