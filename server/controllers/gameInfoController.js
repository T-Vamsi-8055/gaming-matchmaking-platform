import { pool } from "../config/db.js";

async function handleGameInfo(req,res){
    const gameName=req.params.game_name;
    const userId=req.user.id;
    try{
        const response=await pool.query("select gamer_id from profiles where user_id=$1 ",[userId]);
        const gamerId=response.rows[0].gamer_id;
        const gameData=await pool.query("select * from mock_game_data where gamer_id=$1 and game_name=$2",[gamerId,gameName]);
        return res.status(200).json({
            gameData:gameData.rows[0]
        })

    }catch(err){
        console.log(err)
        
        return res.status(500).json({
            message:"Server side error"
        })
        
    }
}
export {handleGameInfo}