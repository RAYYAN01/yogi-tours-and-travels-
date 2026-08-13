// Postgres dialect (migrated from node:sqlite for Vercel deployment — see
// connection.ts). Booleans are kept as INTEGER 0/1 rather than native
// BOOLEAN so the app-layer `0 | 1` types and `=== 1` checks didn't need to
// change during the migration.
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('car','tempo-traveller','mini-bus','tourist-bus')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  seats INTEGER NOT NULL,
  luggage TEXT NOT NULL,
  ac INTEGER NOT NULL DEFAULT 1,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  features TEXT NOT NULL DEFAULT '[]',
  "imageKey" TEXT NOT NULL DEFAULT '',
  gallery TEXT NOT NULL DEFAULT '[]',
  "vehicleClass" TEXT NOT NULL DEFAULT '',
  rating REAL,
  "ratePerKm" INTEGER,
  featured INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  "updatedAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'route',
  "shortDescription" TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  highlights TEXT NOT NULL DEFAULT '[]',
  "imageKey" TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  "updatedAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  destination TEXT NOT NULL,
  "travelCategory" TEXT NOT NULL DEFAULT 'Hill Station',
  duration TEXT NOT NULL DEFAULT '',
  "startLocation" TEXT NOT NULL DEFAULT 'Bangalore',
  "idealFor" TEXT NOT NULL DEFAULT '',
  highlights TEXT NOT NULL DEFAULT '[]',
  "vehicleOptions" TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  "imageKey" TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  "updatedAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  "updatedAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  review TEXT NOT NULL,
  "tripType" TEXT NOT NULL DEFAULT '',
  "isPlaceholder" INTEGER NOT NULL DEFAULT 1,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  "updatedAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'Vehicles',
  "imageKey" TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  "altText" TEXT NOT NULL DEFAULT '',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  "updatedAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  "coverImageKey" TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Yogi Tours & Travels',
  published INTEGER NOT NULL DEFAULT 1,
  "publishedAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  "updatedAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'contact',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  "pickupLocation" TEXT,
  destination TEXT,
  "tripType" TEXT,
  "pickupDate" TEXT,
  "returnDate" TEXT,
  "vehicleType" TEXT,
  passengers TEXT,
  message TEXT,
  "sourcePage" TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  "createdAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_createdat ON enquiries("createdAt");
`;
