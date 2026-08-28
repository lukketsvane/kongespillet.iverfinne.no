import { Pool } from 'pg';

const rawConnectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

function normalizeConnectionString(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('sslcert');
    url.searchParams.delete('sslkey');
    url.searchParams.delete('sslrootcert');
    return url.toString();
  } catch {
    return value;
  }
}

const connectionString = normalizeConnectionString(rawConnectionString);
const globalPg = globalThis;
const pool = connectionString
  ? (globalPg.__finnHaraldPool ||= new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
    }))
  : null;

let initPromise;
function init() {
  if (!pool) throw new Error('Missing POSTGRES_URL');
  initPromise ||= pool.query(`
    CREATE TABLE IF NOT EXISTS finn_harald_leaderboard (
      player_id text PRIMARY KEY,
      age integer NOT NULL DEFAULT 0 CHECK (age >= 0),
      score bigint NOT NULL DEFAULT 0 CHECK (score >= 0),
      streak integer NOT NULL DEFAULT 0 CHECK (streak >= 0),
      achieved_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS finn_harald_players (
      player_id text PRIMARY KEY,
      display_name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS finn_harald_leaderboard_rank_idx
      ON finn_harald_leaderboard (age DESC, score DESC, streak DESC, achieved_at ASC, player_id ASC);
    CREATE UNIQUE INDEX IF NOT EXISTS finn_harald_players_display_name_lower_uidx
      ON finn_harald_players (lower(display_name));
    ALTER TABLE finn_harald_leaderboard ENABLE ROW LEVEL SECURITY;
    ALTER TABLE finn_harald_players ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE finn_harald_leaderboard FROM anon, authenticated;
    REVOKE ALL ON TABLE finn_harald_players FROM anon, authenticated;
  `);
  return initPromise;
}

function cleanId(value) {
  const id = String(value || '').trim();
  if (!/^[a-zA-Z0-9_-]{12,100}$/.test(id)) return null;
  return id;
}

function cleanName(value) {
  const name = String(value || '').trim();
  if (name.length < 2 || name.length > 18) return null;
  if (!/^[\p{L}\p{N}_-]+$/u.test(name)) return null;
  return name;
}

function cleanInt(value, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(max, Math.floor(n)));
}

const rankedSql = `
  SELECT
    l.player_id,
    COALESCE(p.display_name, 'ANONYM') AS display_name,
    l.age,
    l.score::text AS score,
    l.streak,
    ROW_NUMBER() OVER (
      ORDER BY l.age DESC, l.score DESC, l.streak DESC, l.achieved_at ASC, l.player_id ASC
    )::int AS rank
  FROM finn_harald_leaderboard l
  LEFT JOIN finn_harald_players p ON p.player_id = l.player_id
`;

function publicRow(row, playerId) {
  return {
    rank: Number(row.rank),
    name: row.display_name || 'ANONYM',
    age: Number(row.age),
    score: Number(row.score),
    streak: Number(row.streak),
    isYou: row.player_id === playerId,
  };
}

async function profileFor(playerId) {
  if (!playerId) return null;
  const result = await pool.query(
    `SELECT display_name FROM finn_harald_players WHERE player_id = $1 LIMIT 1`,
    [playerId]
  );
  const row = result.rows[0];
  return row ? { displayName: row.display_name } : null;
}

async function boardFor(playerId) {
  const [topResult, countResult, profile] = await Promise.all([
    pool.query(`WITH ranked AS (${rankedSql}) SELECT * FROM ranked WHERE rank <= 10 ORDER BY rank`),
    pool.query(`SELECT COUNT(*)::int AS count FROM finn_harald_leaderboard`),
    profileFor(playerId),
  ]);

  let player = null;
  let nearby = [];
  if (playerId) {
    const playerResult = await pool.query(
      `WITH ranked AS (${rankedSql}) SELECT * FROM ranked WHERE player_id = $1 LIMIT 1`,
      [playerId]
    );
    player = playerResult.rows[0] || null;
    if (player && Number(player.rank) > 10) {
      const from = Math.max(1, Number(player.rank) - 2);
      const to = Number(player.rank) + 2;
      const nearbyResult = await pool.query(
        `WITH ranked AS (${rankedSql}) SELECT * FROM ranked WHERE rank BETWEEN $1 AND $2 ORDER BY rank`,
        [from, to]
      );
      nearby = nearbyResult.rows;
    }
  }

  return {
    total: Number(countResult.rows[0]?.count || 0),
    profile,
    top: topResult.rows.map((row) => publicRow(row, playerId)),
    player: player ? publicRow(player, playerId) : null,
    nearby: nearby.map((row) => publicRow(row, playerId)),
  };
}

async function saveProfile(playerId, displayName) {
  await pool.query(
    `
      INSERT INTO finn_harald_players (player_id, display_name, created_at, updated_at)
      VALUES ($1, $2, now(), now())
      ON CONFLICT (player_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        updated_at = now()
    `,
    [playerId, displayName]
  );
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await init();

    if (req.method === 'GET') {
      const playerId = cleanId(req.query.playerId);
      return res.status(200).json(await boardFor(playerId));
    }

    if (req.method === 'PATCH') {
      const playerId = cleanId(req.body?.playerId);
      const displayName = cleanName(req.body?.displayName);
      if (!playerId || !displayName) {
        return res.status(400).json({
          error: 'Invalid username',
          code: 'invalid_username',
          hint: 'Use 2–18 letters, numbers, _ or -',
        });
      }
      try {
        await saveProfile(playerId, displayName);
      } catch (error) {
        if (error?.code === '23505') {
          return res.status(409).json({ error: 'Username is taken', code: 'username_taken' });
        }
        throw error;
      }
      return res.status(200).json(await boardFor(playerId));
    }

    if (req.method === 'POST') {
      const playerId = cleanId(req.body?.playerId);
      const age = cleanInt(req.body?.age, 100000);
      const score = cleanInt(req.body?.score, 9_000_000_000_000_000);
      const streak = cleanInt(req.body?.streak, 100000);
      if (!playerId || age === null || score === null || streak === null) {
        return res.status(400).json({ error: 'Invalid leaderboard entry' });
      }

      await pool.query(
        `
          INSERT INTO finn_harald_leaderboard (player_id, age, score, streak, achieved_at)
          VALUES ($1, $2, $3, $4, now())
          ON CONFLICT (player_id) DO UPDATE SET
            age = EXCLUDED.age,
            score = EXCLUDED.score,
            streak = EXCLUDED.streak,
            achieved_at = now()
          WHERE
            EXCLUDED.age > finn_harald_leaderboard.age
            OR (EXCLUDED.age = finn_harald_leaderboard.age AND EXCLUDED.score > finn_harald_leaderboard.score)
            OR (EXCLUDED.age = finn_harald_leaderboard.age AND EXCLUDED.score = finn_harald_leaderboard.score AND EXCLUDED.streak > finn_harald_leaderboard.streak)
        `,
        [playerId, age, score, streak]
      );

      return res.status(200).json(await boardFor(playerId));
    }

    res.setHeader('Allow', 'GET, POST, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('leaderboard error', error);
    return res.status(503).json({
      error: 'Leaderboard unavailable',
      code: connectionString ? (error?.code || 'database_error') : 'missing_database_env',
    });
  }
}
