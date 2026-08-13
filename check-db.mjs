import pg from "pg";
const { Pool } = pg;

const ref = "bjoxworfzljqaqvgypgj";
const password = "0945d256-a162-4942-a916-17e0163d485e";

// Try a handful of representative regions and ports; log the exact error type
const tries = [];
for (const region of ["ap-south-1", "ap-southeast-1", "ap-east-1", "us-east-1", "eu-west-1", "sa-east-1", "ca-central-1", "ap-northeast-1"]) {
  tries.push({ label: `pooler:${region}:6543`, host: `aws-0-${region}.pooler.supabase.com`, port: 6543 });
  tries.push({ label: `pooler:${region}:5432`, host: `aws-0-${region}.pooler.supabase.com`, port: 5432 });
  tries.push({ label: `direct:${region}`, host: `db.${ref}.supabase.co`, port: 5432 });
}

const seen = new Set();
for (const t of tries) {
  const pool = new Pool({
    connectionString: `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${t.host}:${t.port}/postgres`,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    const { rows } = await pool.query("SELECT 1");
    console.log(`SUCCESS ${t.label}`);
  } catch (err) {
    const code = err.code || "?";
    let msg = err.message || "?";
    const key = code;
    if (msg.includes("password authentication") || msg.includes("28P01")) key = "AUTH-FAIL";
    if (msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND") || msg.includes("ETIMEDOUT") || msg.includes("timeout")) key = `NET-${msg.includes("refused") ? "REFUSED" : "TIMEOUT"}`;
    if (!seen.has(key)) {
      seen.add(key);
      console.log(`${t.label}: code=${code} msg=${msg.slice(0, 100)}`);
    }
  } finally {
    await pool.end().catch(() => {});
  }
}