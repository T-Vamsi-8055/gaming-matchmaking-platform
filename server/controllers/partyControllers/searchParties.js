import { pool } from "../../config/db.js";

export const searchParties = async (req, res) => {
    try {
        console.log("hi")
        const {searchItem}=req.query;
        if(!searchItem || searchItem.trim()==="")return res.json([]);
        const result = await pool.query(
            `select party_name,invite_code from parties where visibility=$1 and party_name ilike $2 order by party_name limit 5 `,["PUBLIC",`%${searchItem}%`]
            
        );
        console.log(searchItem,result.rows)
        const rows=result.rows;
        let array=[];
        rows.forEach((el)=>{
            array.push([el.party_name,el.invite_code]);
        })
        
        return res.status(200).json({
            parties:array
        });

    } catch (error) {
        console.error("search parties error:", error);

        return res.status(500).json({
            message: "Failed to search parties"
        });
    }
};