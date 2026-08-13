import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${WIDTH}" y2="${HEIGHT}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F6F8F0"/>
      <stop offset="1" stop-color="#f1f4b9"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${WIDTH}" height="14" fill="#942106"/>
  <rect x="0" y="${HEIGHT - 14}" width="${WIDTH}" height="14" fill="#942106"/>

  <text x="90" y="350" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="60" font-weight="800" fill="#491607">Yogi Tours &amp; Travels</text>
  <text x="90" y="400" font-family="Arial, sans-serif" font-size="26" font-weight="600" fill="#634c45">Cars &#183; Tempo Travellers</text>
  <text x="90" y="436" font-family="Arial, sans-serif" font-size="26" font-weight="600" fill="#634c45">Mini Buses &#183; Tourist Buses</text>
  <text x="90" y="480" font-family="Arial, sans-serif" font-size="24" fill="#7d655e">Bangalore, Karnataka</text>

  <rect x="90" y="510" width="330" height="56" rx="28" fill="#942106"/>
  <text x="255" y="546" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#F6F8F0" text-anchor="middle">www.yogitourstravels.com</text>
</svg>`;

const logoPath = path.join(publicDir, "assets/images/logo.png");
const logo = await sharp(logoPath).resize(340, 340).png().toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: WIDTH - 340 - 90, top: (HEIGHT - 340) / 2 }])
  .png()
  .toFile(path.join(publicDir, "assets/images/og-default.png"));

console.log("wrote", path.join(publicDir, "assets/images/og-default.png"));
