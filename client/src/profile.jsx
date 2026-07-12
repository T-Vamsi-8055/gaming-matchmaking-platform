import React, { useState } from 'react';

export default function Profile({ registeredName }) {
  const [profile, setProfile] = useState({
   name: registeredName || '',
   description: '',
   profilePic: null, 
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
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}