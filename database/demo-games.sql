BEGIN;

WITH demo_games (
    title,
    original_release_year,
    esrb_rating,
    max_local_multiplayer_players,
    personal_comments,
    console_name
) AS (
    VALUES
        ('Demo: Celestial Quest', 2021, 'E10+', 2, 'Sample game for the local Compose demo.', 'Nintendo Switch'),
        ('Demo: Neon Circuit', 2022, 'E', 4, 'Sample game for the local Compose demo.', 'Sony PlayStation 5'),
        ('Demo: Puzzle Garden', 2023, 'E', 1, 'Sample game for the local Compose demo.', 'Nintendo Entertainment System')
)
INSERT INTO games (
    title,
    original_release_year,
    esrb_rating,
    max_local_multiplayer_players,
    personal_comments
)
SELECT
    demo_games.title,
    demo_games.original_release_year,
    demo_games.esrb_rating,
    demo_games.max_local_multiplayer_players,
    demo_games.personal_comments
FROM demo_games
WHERE NOT EXISTS (
    SELECT 1
    FROM games
    WHERE games.title = demo_games.title
      AND games.original_release_year = demo_games.original_release_year
);

WITH demo_games (title, original_release_year, console_name) AS (
    VALUES
        ('Demo: Celestial Quest', 2021, 'Nintendo Switch'),
        ('Demo: Neon Circuit', 2022, 'Sony PlayStation 5'),
        ('Demo: Puzzle Garden', 2023, 'Nintendo Entertainment System')
)
INSERT INTO game_consoles (game_id, console_id)
SELECT games.id, consoles.id
FROM demo_games
JOIN games
  ON games.title = demo_games.title
 AND games.original_release_year = demo_games.original_release_year
JOIN consoles ON consoles.name = demo_games.console_name
ON CONFLICT (game_id, console_id) DO NOTHING;

COMMIT;
