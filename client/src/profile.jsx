import React, { useState,useEffect } from 'react';


const AVAILABLE_GAMES = [
    "Valorant",
    "CS2",
    "PUBG",
    "Dota 2",
    "League of Legends",
    "Apex Legends"
];
const API_PORT=3000;
const registeredName=localStorage.getItem("registeredName") || '';
export default function Profile() {
  const [profile, setProfile] = useState({
   name: registeredName,
   description: '',
   rank:"",
   profilePic: null,
   preferredGames: [],
   region:"",
   socialLinks: { twitter: '', discord: '', twitch: '' },
  });
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleSubmit =async (e) => {
    e.preventDefault();
    console.log('Saving Profile:', profile);
    try{
      const formData=new FormData();
      
      formData.append("description",profile.description);
      formData.append("rank",profile.rank);
      formData.append("profilePic",profile.profilePic);
      formData.append("region",profile.region);
      formData.append("preferredGames",JSON.stringify(profile.preferredGames));
      formData.append("socialLinks",JSON.stringify(profile.socialLinks));
      const token=localStorage.getItem("jwt-auth-token");
      const response=await fetch(`http://localhost:${API_PORT}/api/profile`,{
        method: "PUT",
        credentials: "include",
        headers: {
          Authorization:`Bearer ${token}`
        },
        body: (formData),
      });
      if (!response.ok) {
          throw new Error("Failed");
        }
      
      }catch(err){
        console.error("Error occured:",err)
      }
    
    
  };

  const handleChange = (e) => {
   const { name, value } = e.target;
   setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
        setProfile(prev => ({
            ...prev,
            profilePic: file
        }));
    }
};

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },

    }));
  };

  const handleGamesToggle = (game) => {
   setProfile((prev) => {
     const currentGames = prev.preferredGames.includes(game)
       ? prev.preferredGames.filter((g) => g !== game)
       : [...prev.preferredGames, game];
     return { ...prev, preferredGames: currentGames };
    });
  };
  const fetchExistingData=async ()=>{
    const token=localStorage.getItem("jwt-auth-token");

    const response=await fetch(`http://localhost:${API_PORT}/api/profile`,{
        method: "GET",
        credentials: "include",
        headers: {
          Authorization:`Bearer ${token}`,
        },
      })
      const data = await response.json();
      if (!response.ok) {
          throw new Error("Failed");
        }
      return data.data;
;
  }
  useEffect(()=>{
    async function load(){
      const ExistingData=await fetchExistingData();
    if(ExistingData){
        setAvatarUrl(ExistingData.avatar_url);

    let profileData={name: registeredName};
    profileData.description=ExistingData.bio;
    profileData.rank=ExistingData.rank;
    profileData.profilePic=null;

    profileData.region=ExistingData.region;
    profileData.preferredGames=ExistingData.preferred_games;
    profileData.socialLinks={};
    profileData.socialLinks.twitter=ExistingData.twitter;
    profileData.socialLinks.discord=ExistingData.discord;
    profileData.socialLinks.twitch=ExistingData.twitch;
    console.log(profileData);
    setProfile(profileData);
    
    }
    }
    load();
  },[])
  useEffect(() => {
      console.log(profile);
    }, [profile]);
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>Setup Your Profile</h2>
      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: '15px' }}>
          <label>Profile Picture:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
         {(profile.profilePic || avatarUrl) && (
            <img
              src={
                profile.profilePic instanceof File
                
                  ? URL.createObjectURL(profile.profilePic)
                  : `http://localhost:${API_PORT}/${avatarUrl.replace(/\\/g, "/")}`
              }
              alt="Preview"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                marginTop: "10px",
              }}
            />
          )}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Name:</label>
          <input 
            type="text" 
            name="name" 
            value={profile.name} 
             onChange={handleChange} 
            style={{ width: '100%', display: 'block' ,color:"black"}} 
          />
          <label>Rank:</label>
          </div><div style={{ marginBottom: '15px' }}>
          <input 
            type="text" inputMode='numeric' 
            name="rank" 
            onChange={handleChange} 

            value={profile.rank}  
            style={{ width: '100%', display: 'block' }} 
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Bio / Description:</label>
          <textarea 
           name="description" 
           value={profile.description} 
           onChange={handleChange} 
           placeholder="Tell us about yourself..."
           style={{ width: '100%', height: '80px', display: 'block' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Region:</label>
          <textarea 
           name="region" 
           value={profile.region} 
           onChange={handleChange} 
           placeholder="Enter your region"
           style={{ width: '100%', height: '80px', display: 'block' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Games you play:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px' }}>
            {AVAILABLE_GAMES.map((game) => (
              <label key={game}>
                <input 
                 type="checkbox"
                 checked={profile.preferredGames.includes(game)} 
                 onChange={() => handleGamesToggle(game)} 
                /> {game}
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Social Links:</label>
            <input 
             type="text" 
             name="twitter" 
             value={profile.socialLinks.twitter} 
             onChange={handleSocialChange} 
             placeholder="Twitter URL" 
             style={{ width: '100%', marginBottom: '5px', display: 'block' }} 
            />
            
            <input 
             type="text" 
             name="discord" 
             value={profile.socialLinks.discord} 
             onChange={handleSocialChange} 
             placeholder="Discord Tag" 
             style={{ width: '100%', marginBottom: '5px', display: 'block' }} 
            />
            
            <input 
             type="text" 
             name="twitch" 
             value={profile.socialLinks.twitch} 
             onChange={handleSocialChange} 
             placeholder="Twitch URL" 
             style={{ width: '100%', display: 'block' }} 
            />
        </div>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}