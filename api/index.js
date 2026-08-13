// Vercel serverless entrypoint. Requires `npm run build` to have produced
// dist/server/app.js first (Vercel's buildCommand, set in vercel.json,
// does this). Kept as plain JS (not TS) so Vercel's Node runtime can load it
// with zero extra config.
import app from "../dist/server/app.js";

export default app;
