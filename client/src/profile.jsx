import React, { useState } from 'react';


const AVAILABLE_GENRES = ['FPS', 'RPG', 'Strategy', 'MOBA', 'Fighting', 'Sim'];

export default function Profile({ registeredName }) {
  const [profile, setProfile] = useState({
   name: registeredName || '',
   description: '',
   profilePic: null,
   genres: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving Profile:', profile);
  };

  const handleChange = (e) => {
   const { name, value } = e.target;
   setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
   const file = e.target.files[0];
   if (file) {
     setProfile((prev) => ({ ...prev, profilePic: URL.createObjectURL(file) }));
   }
  };

  const handleGenreToggle = (genre) => {
   setProfile((prev) => {
     const currentGenres = prev.genres.includes(genre)
       ? prev.genres.filter((g) => g !== genre)
       : [...prev.genres, genre];
     return { ...prev, genres: currentGenres };
    });
  };


  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>Setup Your Profile</h2>
      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: '15px' }}>
          <label>Profile Picture:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {profile.profilePic && (
            <img src={profile.profilePic} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', marginTop: '10px' }} />
          )}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Name:</label>
          <input 
            type="text" 
            name="name" 
            value={profile.name} 
            disabled 
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
          <label>Favorite Game Genres:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px' }}>
            {AVAILABLE_GENRES.map((genre) => (
              <label key={genre}>
                <input 
                 type="checkbox"
                 checked={profile.genres.includes(genre)} 
                 onChange={() => handleGenreToggle(genre)} 
                /> {genre}
              </label>
            ))}
          </div>
        </div>
        
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}