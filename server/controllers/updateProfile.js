import {pool} from "../config/db.js"

async function handleUserProfileUpdate(req,res){

    try{
    const profile=req.body;
    const file=req.file;
    const avatar = file ? file.path : null;
    const preferredGames =
    JSON.parse(req.body.preferredGames);
    const socialLinks = JSON.parse(req.body.socialLinks);
        const response=await pool.query("insert into PROFILES (user_id,bio,avatar_url,preferred_games,rank,region,twitter,discord,twitch) values($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (user_id) do update set bio=EXCLUDED.bio,avatar_url=EXCLUDED.avatar_url,preferred_games=EXCLUDED.preferred_games,rank=EXCLUDED.rank,region=EXCLUDED.region,twitter=EXCLUDED.twitter,twitch=EXCLUDED.twitch,discord=EXCLUDED.discord",[req.user.id,profile.description,avatar,preferredGames,profile.rank,profile.region,socialLinks.twitter,socialLinks.discord,socialLinks.twitch]);
        
        res.status(200).json({
            message:"User profile updated."
        })

    }catch(err){
        console.error("Error:",err);
        res.status(500).json({message:"Server side error"})
    }

} 

async function handleGetUserProfile(req,res){
    const userId=req.user.id;
    try{
    const response=await pool.query("select * from profiles where user_id=$1",[userId]);
    if(response.rows[0])
    res.status(200).json({
        data:response.rows[0],
        message:"Data found successfully"
    })
    else res.status(404).json({
        message:"404 not found"
    })
    }catch(err){
        console.error("Error:",err);
        res.status(500).json({
            message:"Server side Error."
        })
    }
}

export {handleGetUserProfile,  handleUserProfileUpdate};