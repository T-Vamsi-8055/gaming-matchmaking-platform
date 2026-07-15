-- ===========================
-- USERS
-- ===========================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- PENDING USERS
-- ===========================

CREATE TABLE IF NOT EXISTS pending_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_sent_at TIMESTAMP DEFAULT NOW()
);

-- PROFILE STORAGE

CREATE TABLE IF NOT EXISTS profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    bio TEXT,
    avatar_url TEXT,

    preferred_games TEXT[],

    gamer_id VARCHAR(50),
    region VARCHAR(50),

    twitter TEXT,
    discord TEXT,
    twitch TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--MOCK GAME DATA

CREATE TABLE IF NOT EXISTS mock_game_data (
    id SERIAL PRIMARY KEY,

    gamer_id VARCHAR(50) NOT NULL,
    game_name VARCHAR(50) NOT NULL,

    rank VARCHAR(30),

    skill_rating INT,

    games_played INT,

    wins INT,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(gamer_id, game_name)
);

-- ===========================
-- INDEXES
-- ===========================

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_pending_users_email
ON pending_users(email);

CREATE INDEX IF NOT EXISTS idx_pending_users_expires
ON pending_users(expires_at);

CREATE INDEX IF NOT EXISTS idx_profiles_region
ON profiles(region);

CREATE INDEX IF NOT EXISTS idx_profiles_gamer_id
ON profiles(gamer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_games
ON profiles
USING GIN (preferred_games);