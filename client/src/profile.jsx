import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AVAILABLE_GAMES = [
    "Valorant",
    "CS2",
    "PUBG",
    "Dota 2",
    "League of Legends",
    "Apex Legends"
];
const API_PORT = 3000;
const registeredName = localStorage.getItem("registeredName") || '';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: registeredName,
    description: '',
    rank: "",
    profilePic: null,
    preferredGames: [],
    region: "",
    socialLinks: { twitter: '', discord: '', twitch: '' },
  });
  const [avatarURL, setAvatarURL] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Saving Profile:', profile);
    try {
      const formData = new FormData();
      formData.append("description", profile.description);
      formData.append("rank", profile.rank);
      if (profile.profilePic instanceof File) {
          formData.append("profilePic", profile.profilePic);
      }
      formData.append("region", profile.region);
      formData.append("preferredGames", JSON.stringify(profile.preferredGames));
      formData.append("socialLinks", JSON.stringify(profile.socialLinks));
      
      const token = localStorage.getItem("jwt-auth-token");
      const response = await fetch(`http://localhost:${API_PORT}/api/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed");
      }
    } catch (err) {
      console.error("Error occurred:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarURL(URL.createObjectURL(file));
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

  const fetchExistingData = async () => {
    const token = localStorage.getItem("jwt-auth-token");
    const response = await fetch(`http://localhost:${API_PORT}/api/profile`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error("Failed");
    }
    return data.data;
  };

  useEffect(() => {
    async function load() {
      try {
        const ExistingData = await fetchExistingData();
        if (ExistingData) {
          setAvatarURL(ExistingData.avatar_url);

          let profileData = { name: registeredName };
          profileData.description = ExistingData.bio || '';
          profileData.rank = ExistingData.rank || '';
          profileData.profilePic = null;
          profileData.region = ExistingData.region || '';
          profileData.preferredGames = ExistingData.preferred_games || [];
          profileData.socialLinks = {
            twitter: ExistingData.twitter || '',
            discord: ExistingData.discord || '',
            twitch: ExistingData.twitch || ''
          };
          console.log(profileData);
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400">
      {/* Navbar */}
      <div className="fixed flex flex-row z-50 min-w-screen w-full min-h-10 sm:flex-row sm:items-center justify-between bg-neutral-900 border-b border-b-neutral-700 p-2">
        <button 
          onClick={() => navigate("/")} 
          className="hover:bg-neutral-600 text-xs w-24 font-mono tracking-widest text-zinc-400 uppercase bg-neutral-700 border border-neutral-500 p-0 rounded inline-block h-6"
        >
          ← Home
        </button>
        <div className="text-xs font-mono tracking-widest text-zinc-500 pr-4 uppercase">
          Agent Profile Setup
        </div>
      </div>

      {/* Main Layout Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 pt-20 pb-12 flex justify-center">
        <main className="w-full max-w-2xl space-y-8">
          
          {/* Main Card Panel Container */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Header Title */}
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-zinc-400 uppercase drop-shadow-sm">
                  SETUP YOUR <span className="text-cyan-400">PROFILE</span>
                </h1>
                <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono mt-1">Identity & Network Protocol</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6 space-y-6">
                
                {/* Profile Picture Upload Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
                  <div className="relative w-20 h-20 bg-zinc-950 border border-white/10 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    {(profile.profilePic || avatarURL) ? (
                      <img 
                        src={
                          profile.profilePic instanceof File
                            ? URL.createObjectURL(profile.profilePic)
                            : `http://localhost:${API_PORT}/${avatarURL.replace(/\\/g, "/")}`
                        } 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-2xl text-zinc-600">👤</span>
                    )}
                  </div>
                  <div className="text-left space-y-1.5 w-full">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold block">Profile Picture</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="w-full text-xs text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border file:border-neutral-500 file:text-xs file:font-mono file:tracking-widest file:bg-neutral-700 file:text-zinc-300 hover:file:bg-neutral-600 file:cursor-pointer"
                    />
                  </div>
                </div>

                {/* Name and Rank Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-left space-y-1.5">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Agent Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={profile.name} 
                      onChange={handleChange} 
                      className="w-full bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-lg p-2.5 outline-none transition-all duration-200 text-sm font-mono"
                    />
                  </div>

                  <div className="text-left space-y-1.5">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Rank / Rating</label>
                    <input 
                      type="text" 
                      inputMode="numeric" 
                      name="rank" 
                      value={profile.rank}  
                      onChange={handleChange} 
                      placeholder="e.g. Diamond II"
                      className="w-full bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-lg p-2.5 outline-none transition-all duration-200 text-sm"
                    />
                  </div>
                </div>

                {/* Bio / Description Field */}
                <div className="text-left space-y-1.5">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Bio / Description</label>
                  <textarea 
                    name="description" 
                    value={profile.description} 
                    onChange={handleChange} 
                    placeholder="Tell us about yourself..."
                    className="w-full h-24 bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-lg p-2.5 outline-none transition-all duration-200 text-sm resize-none placeholder-zinc-600"
                  />
                </div>

                {/* Region Field */}
                <div className="text-left space-y-1.5">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Region Deployment</label>
                  <input 
                    type="text"
                    name="region" 
                    value={profile.region} 
                    onChange={handleChange} 
                    placeholder="e.g. North America, Europe West"
                    className="w-full bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-lg p-2.5 outline-none transition-all duration-200 text-sm placeholder-zinc-600"
                  />
                </div>

                {/* Preferred Games Grid Selection */}
                <div className="text-left space-y-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold block">Games You Play</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_GAMES.map((game) => {
                      const isChecked = profile.preferredGames.includes(game);
                      return (
                        <button
                          type="button"
                          key={game}
                          onClick={() => handleGamesToggle(game)}
                          className={`p-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border transition-all duration-200 text-center
                            ${isChecked 
                              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]' 
                              : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:border-white/20 hover:text-slate-200'
                            }`}
                        >
                          {game} {isChecked && ' ✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Social Links Network Inputs */}
                <div className="text-left space-y-3">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold block">Social Matrix Links</label>
                  <div className="space-y-2">
                    <div className="flex bg-zinc-950/80 border border-white/10 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all duration-200 rounded-lg overflow-hidden items-center px-3">
                      <span className="text-xs text-zinc-500 font-mono w-16 shrink-0 uppercase">Twitter</span>
                      <input 
                        type="text" 
                        name="twitter" 
                        value={profile.socialLinks.twitter} 
                        onChange={handleSocialChange} 
                        placeholder="Twitter URL" 
                        className="w-full bg-transparent py-2.5 text-sm text-slate-200 outline-none placeholder-zinc-600 pl-2 border-l border-white/5"
                      />
                    </div>
                    
                    <div className="flex bg-zinc-950/80 border border-white/10 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all duration-200 rounded-lg overflow-hidden items-center px-3">
                      <span className="text-xs text-zinc-500 font-mono w-16 shrink-0 uppercase">Discord</span>
                      <input 
                        type="text" 
                        name="discord" 
                        value={profile.socialLinks.discord} 
                        onChange={handleSocialChange} 
                        placeholder="Discord Tag" 
                        className="w-full bg-transparent py-2.5 text-sm text-slate-200 outline-none placeholder-zinc-600 pl-2 border-l border-white/5"
                      />
                    </div>
                    
                    <div className="flex bg-zinc-950/80 border border-white/10 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all duration-200 rounded-lg overflow-hidden items-center px-3">
                      <span className="text-xs text-zinc-500 font-mono w-16 shrink-0 uppercase">Twitch</span>
                      <input 
                        type="text" 
                        name="twitch" 
                        value={profile.socialLinks.twitch} 
                        onChange={handleSocialChange} 
                        placeholder="Twitch URL" 
                        className="w-full bg-transparent py-2.5 text-sm text-slate-200 outline-none placeholder-zinc-600 pl-2 border-l border-white/5"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:bg-cyan-400 rounded-xl font-black uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98]"
                >
                  Save Profile
                </button>

              </form>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}