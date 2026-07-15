-- Seed mock analytics data for testing the game-data route.
-- Update the user_id below to match the account you want to test with.
-- Example: if your logged-in account has id = 1, keep it as 1.

INSERT INTO profiles (
    user_id,
    gamer_id,
    preferred_games,
    region,
    bio
)
VALUES (
    qwert,
    'gamer-demo-01',
    ARRAY['Valorant', 'Counter-Strike 2', 'PUBG', 'Dota 2', 'League of Legends', 'Apex Legends'],
    'North America',
    'Test profile for analytics demo'
)
ON CONFLICT (user_id) DO UPDATE SET
    gamer_id = EXCLUDED.gamer_id,
    preferred_games = EXCLUDED.preferred_games,
    region = EXCLUDED.region,
    bio = EXCLUDED.bio;

INSERT INTO mock_game_data (
    gamer_id,
    game_name,
    rank,
    skill_rating,
    games_played,
    wins
)
VALUES
    ('gamer-demo-01', 'valorant', 'Radiant', 1820, 142, 118),
    ('gamer-demo-01', 'cs2', 'Gold Nova', 1540, 96, 63),
    ('gamer-demo-01', 'pubg', 'Platinum', 1380, 74, 41),
    ('gamer-demo-01', 'dota2', 'Immortal', 2100, 189, 126),
    ('gamer-demo-01', 'lol', 'Diamond', 1700, 111, 84),
    ('gamer-demo-01', 'apex', 'Master', 1650, 88, 57)
ON CONFLICT (gamer_id, game_name) DO UPDATE SET
    rank = EXCLUDED.rank,
    skill_rating = EXCLUDED.skill_rating,
    games_played = EXCLUDED.games_played,
    wins = EXCLUDED.wins;
