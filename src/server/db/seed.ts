// Idempotent database seed: populates every content table with original,
// non-fabricated copy so the site launches fully populated. Re-running this
// script is safe — tables that already have rows are left untouched.
import "dotenv/config";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initSchema } from "./connection.js";
import { vehiclesRepo, servicesRepo, packagesRepo, faqsRepo, testimonialsRepo, galleryRepo, blogRepo } from "./content.js";
import { adminUserCount, createAdminUser } from "./adminUsers.js";
import type { VehicleCategory, GalleryCategory } from "../types/models.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../../../public");

/**
 * Real photos (Wikimedia Commons free-licensed fetches, or supplied directly —
 * see IMAGE_CREDITS.json) live in public/assets/images/<dir>/<slug>.<ext>,
 * under whichever extension they were saved as. Falls back to "" (branded
 * placeholder) if a photo hasn't been added yet, so a missing file never
 * renders a broken <img>.
 */
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".webp", ".png"];
function findImagePath(dir: string, slug: string): string {
  for (const ext of IMAGE_EXTENSIONS) {
    if (fs.existsSync(path.join(publicDir, "assets/images", dir, `${slug}${ext}`))) {
      return `/assets/images/${dir}/${slug}${ext}`;
    }
  }
  return "";
}
function destinationImagePath(slug: string): string {
  return findImagePath("destinations", slug);
}

/** Same idea for the handful of vehicles with a real fetched/supplied photo. */
function vehicleImagePath(slug: string): string {
  return findImagePath("vehicles", slug);
}

/** Same idea for services (public/assets/images/services/<slug>.<ext>). */
function serviceImagePath(slug: string): string {
  return findImagePath("services", slug);
}

async function seedVehicles(): Promise<void> {
  if ((await vehiclesRepo.count()) > 0) {
    console.log("• vehicles already seeded, skipping");
    return;
  }
  const commonCarFeatures = ["Air Conditioning", "Music System", "Charging Points", "Experienced Driver", "Sanitised Cabin"];
  const commonTTFeatures = ["Air Conditioning", "Push-back Seats", "Reading Lights", "Charging Points", "Ample Luggage Space", "Experienced Driver"];
  const commonBusFeatures = ["Air Conditioning", "Push-back Seats", "Reading Lights", "PA System", "First-Aid Kit", "Overhead Luggage Racks"];

  type Row = {
    category: VehicleCategory; name: string; slug: string; seats: number; luggage: string;
    tagline: string; description: string; features: string[]; featured: 0 | 1; sortOrder: number; ratePerKm?: number;
  };

  const rows: Row[] = [
    // CARS
    { category: "car", name: "Maruti Swift Dzire", slug: "maruti-swift-dzire", seats: 4, luggage: "2 medium bags",
      tagline: "A compact, fuel-efficient sedan for city rides, airport runs and short outstation hops.",
      description: "The Swift Dzire is our most-booked sedan — the practical choice for solo travellers, couples and small families. Ideal for airport transfers, local city travel and short one-way or round-trip outstation journeys where you want a comfortable, economical ride without compromising on punctuality.",
      features: commonCarFeatures, featured: 1, sortOrder: 1, ratePerKm: 13 },
    { category: "car", name: "Toyota Etios", slug: "toyota-etios", seats: 4, luggage: "2 medium bags",
      tagline: "A roomier alternative to the Dzire, with a bigger boot for the same compact-sedan comfort.",
      description: "The Toyota Etios covers the same compact-sedan role as the Dzire with a slightly larger cabin and boot — a good fit when you want a bit more luggage room without stepping up to an MUV. Well suited to airport transfers, local city travel and short outstation trips.",
      features: commonCarFeatures, featured: 0, sortOrder: 2, ratePerKm: 13 },
    { category: "car", name: "Maruti Ertiga", slug: "maruti-ertiga", seats: 6, luggage: "3 medium bags",
      tagline: "A spacious MUV that comfortably seats small families with extra luggage room.",
      description: "The Maruti Ertiga is our recommended pick for small families and groups of five to six travelling together with moderate luggage. It offers noticeably more shoulder and legroom than a sedan while remaining nimble and economical on longer outstation drives.",
      features: commonCarFeatures, featured: 0, sortOrder: 3, ratePerKm: 16 },
    { category: "car", name: "Toyota Innova", slug: "toyota-innova", seats: 7, luggage: "4 bags",
      tagline: "The dependable seven-seater for family trips and longer outstation journeys.",
      description: "A long-standing favourite for Karnataka road trips, the Toyota Innova offers a stable ride, generous cabin space and a proven track record on hill routes like Coorg, Chikmagalur and Ooty. A solid choice when comfort over long distances matters more than frills.",
      features: commonCarFeatures, featured: 0, sortOrder: 4, ratePerKm: 17 },
    { category: "car", name: "Toyota Innova Crysta", slug: "innova-crysta", seats: 7, luggage: "4 bags + extra boot space",
      tagline: "A premium, more refined step up from the Innova with a quieter, plusher cabin.",
      description: "The Innova Crysta is our most requested vehicle for family holidays, corporate travel and airport transfers where presentation matters. It combines the practicality of a seven-seater MUV with noticeably better ride quality, cabin insulation and captain-seat comfort in the middle row.",
      features: commonCarFeatures, featured: 1, sortOrder: 5, ratePerKm: 19 },
    { category: "car", name: "Toyota Innova Hycross", slug: "innova-hycross", seats: 7, luggage: "4 bags",
      tagline: "The newest-generation Innova with a modern cabin and a smoother, refined drive.",
      description: "For clients who want the latest available vehicle in the Innova line-up, the Hycross offers an updated interior, improved comfort features and a smoother ride — well suited to corporate travel, premium family holidays and long outstation itineraries.",
      features: commonCarFeatures, featured: 0, sortOrder: 6 },

    // TEMPO TRAVELLERS
    { category: "tempo-traveller", name: "9 Seater Tempo Traveller", slug: "tempo-traveller-12-seater", seats: 9, luggage: "9 bags + roof carrier",
      tagline: "One of Bangalore's most-booked 9 seater Tempo Travellers — well suited to group outstation trips across Karnataka and pilgrimage tours.",
      description: "The 9 Seater Tempo Traveller is a dependable middle-ground choice for office outings, pilgrimage groups, and multi-family trips. Available for 9 seater Tempo Traveller rental in Bangalore (Bengaluru) and outstation trips across Karnataka and South India. Forward-facing push-back seats, individual windows and a dedicated luggage boot make it well suited to multi-day itineraries.",
      features: commonTTFeatures, featured: 1, sortOrder: 2, ratePerKm: 22 },
    { category: "tempo-traveller", name: "14 Seater Tempo Traveller", slug: "tempo-traveller-14-seater", seats: 14, luggage: "14 bags + roof carrier",
      tagline: "Extra seating capacity for slightly larger groups without stepping up to a mini bus.",
      description: "A practical option when your group is a little larger than 12 but a mini bus feels like overkill. Commonly booked for college friend-group trips, extended family functions and group pilgrimage travel.",
      features: commonTTFeatures, featured: 0, sortOrder: 3 },
    { category: "tempo-traveller", name: "Luxury Tempo Traveller (17 Seater)", slug: "luxury-tempo-traveller-17-seater", seats: 17, luggage: "17 bags + roof carrier",
      tagline: "Premium recliner seating, better cabin finish and extra legroom for longer routes.",
      description: "Built for multi-day outstation tours where comfort matters as much as capacity. The Luxury Tempo Traveller upgrades to plusher recliner seating, improved cabin insulation and a more refined finish — a popular choice for corporate offsites and premium family tours.",
      ratePerKm: 35,
      features: [...commonTTFeatures, "Premium Recliner Seats", "Curtains"], featured: 1, sortOrder: 4 },
    { category: "tempo-traveller", name: "12 Seater Tempo Traveller", slug: "maharaja-tempo-traveller", seats: 12, luggage: "12 bags + roof carrier",
      tagline: "Rated 4.9★ from 210+ Google reviews — one of Bangalore's best 12 seater Tempo Travellers, with wide, sofa-style 'Maharaja' seating for a relaxed, lounge-like group travel experience across Karnataka.",
      description: "The 12 Seater Tempo Traveller (Maharaja configuration) trades a few seats for significantly more width and legroom per passenger, arranged in a lounge-style layout. Available for 12 seater Tempo Traveller rental in Bangalore (Bengaluru) and outstation trips across Karnataka and South India — a favourite for family celebrations, milestone trips and groups who prioritise comfort over headcount.",
      features: [...commonTTFeatures, "Wide Sofa-style Seating", "Curtains"], featured: 0, sortOrder: 5, ratePerKm: 45 },
    { category: "tempo-traveller", name: "17 Seater Tempo Traveller", slug: "tempo-traveller-17-seater", seats: 17, luggage: "17 bags + roof carrier",
      tagline: "Rated 4.9★ from 210+ Google reviews — one of Bangalore's best 17 seater tours and travels options for large groups, with pilgrimage routes to Tirupati and long-distance tours across India.",
      description: "The 17 Seater Tempo Traveller is a Force-built vehicle offering full-size group capacity with push-back seats, individual windows and a dedicated luggage boot. Available for 17 seater Tempo Traveller rental in Bangalore (Bengaluru) and Karnataka-wide outstation trips, plus long-distance group tours to destinations across India — a dependable choice for large family groups, pilgrimage tours and multi-day outstation trips.",
      features: commonTTFeatures, featured: 0, sortOrder: 6 },
    { category: "tempo-traveller", name: "Force Urbania", slug: "force-urbania", seats: 17, luggage: "17 bags + rear storage",
      tagline: "A modern, van-style group vehicle with a smoother ride and contemporary cabin design.",
      description: "The Force Urbania is a newer-generation alternative to the traditional Tempo Traveller body, offering a more car-like ride, a modern interior and strong performance on both city roads and highway stretches — well suited to corporate group travel and premium tours.",
      features: [...commonTTFeatures, "Modern Cabin Design"], featured: 1, sortOrder: 6, ratePerKm: 38 },

    // MINI BUSES
    { category: "mini-bus", name: "20 Seater Mini Bus", slug: "mini-bus-20-seater", seats: 20, luggage: "Overhead racks + rear boot",
      tagline: "The entry point into our mini bus range for mid-sized groups.",
      description: "Suited to office teams, wedding guest groups and mid-sized school outings that need more capacity than a Tempo Traveller but don't require a full-size coach.",
      features: commonBusFeatures, featured: 0, sortOrder: 1 },
    { category: "mini-bus", name: "21 Seater Mini Bus", slug: "mini-bus-21-seater", seats: 21, luggage: "Overhead racks + rear boot",
      tagline: "A close variant of our 20 seater with slightly different seating layouts available.",
      description: "Depending on operator availability, our 21 seater mini buses offer a similar experience to the 20 seater with minor layout differences — a good fallback option when your preferred configuration is already booked.",
      features: commonBusFeatures, featured: 0, sortOrder: 2 }, // Price on Request — no confirmed per-km rate
    { category: "mini-bus", name: "25 Seater Mini Bus", slug: "mini-bus-25-seater", seats: 25, luggage: "Overhead racks + rear boot",
      tagline: "A popular choice for corporate offsites, wedding functions and group pilgrimage tours.",
      description: "Our most frequently requested mini bus size — large enough for a full department or wedding party, while still comfortable to manoeuvre through city routes and hill roads alike.",
      features: commonBusFeatures, featured: 1, sortOrder: 3 },
    { category: "mini-bus", name: "27 Seater Mini Bus", slug: "mini-bus-27-seater", seats: 27, luggage: "Overhead racks + rear boot",
      tagline: "Slightly larger capacity for growing groups without moving up to a full-size coach.",
      description: "A good fit for school groups, community trips and larger family functions that need a handful of extra seats over our 25 seater option.",
      features: commonBusFeatures, featured: 0, sortOrder: 4 },
    { category: "mini-bus", name: "29 Seater Mini Bus", slug: "mini-bus-29-seater", seats: 29, luggage: "Overhead racks + rear boot",
      tagline: "The largest vehicle in our mini bus range, just under full tourist-coach capacity.",
      description: "Bridges the gap between mini buses and full-size tourist coaches — a practical option for larger office teams, wedding groups and educational tours travelling together.",
      features: commonBusFeatures, featured: 0, sortOrder: 5 },

    // TOURIST BUSES
    { category: "tourist-bus", name: "33 Seater Tourist Bus", slug: "tourist-bus-33-seater", seats: 33, luggage: "Under-bus cargo hold",
      tagline: "Our entry-level tourist coach for large group tours and events.",
      description: "A full-size coach suited to large school and college trips, big wedding parties and corporate events, with a dedicated under-bus luggage hold for group baggage.",
      features: commonBusFeatures, featured: 0, sortOrder: 1 },
    { category: "tourist-bus", name: "40 Seater Tourist Bus", slug: "tourist-bus-40-seater", seats: 40, luggage: "Under-bus cargo hold",
      tagline: "A commonly booked coach size for multi-day pilgrimage and group tour packages.",
      description: "Our most requested tourist bus size for multi-day group tours, pilgrimage travel and large corporate events — balancing capacity with manageable on-road handling.",
      features: commonBusFeatures, featured: 1, sortOrder: 2 },
    { category: "tourist-bus", name: "45 Seater Tourist Bus", slug: "tourist-bus-45-seater", seats: 45, luggage: "Under-bus cargo hold",
      tagline: "Extra capacity for larger institutional and corporate group movements.",
      description: "Suited to larger educational institutions, big corporate teams and community or religious group travel that needs more seating than our 40 seater option.",
      features: commonBusFeatures, featured: 0, sortOrder: 3 },
    { category: "tourist-bus", name: "49 Seater Tourist Bus", slug: "tourist-bus-49-seater", seats: 49, luggage: "Under-bus cargo hold",
      tagline: "A near-maximum capacity coach for the largest group movements we handle.",
      description: "Ideal for very large tour groups, institutional travel and big event logistics where a single coach covering the whole group is more practical than splitting across multiple vehicles.",
      features: commonBusFeatures, featured: 0, sortOrder: 4 },
    { category: "tourist-bus", name: "50 Seater Tourist Bus", slug: "tourist-bus-50-seater", seats: 50, luggage: "Under-bus cargo hold",
      tagline: "The largest vehicle in our fleet for full-scale group and institutional travel.",
      description: "Our maximum-capacity coach option, typically booked for the largest school, college, corporate and community group tours where a single large vehicle is the most efficient way to move everyone together.",
      features: commonBusFeatures, featured: 0, sortOrder: 5 }
  ];

  for (const r of rows) {
    await vehiclesRepo.insert({
      category: r.category,
      name: r.name,
      slug: r.slug,
      seats: r.seats,
      luggage: r.luggage,
      ac: 1,
      tagline: r.tagline,
      description: r.description,
      features: JSON.stringify(r.features),
      imageKey: vehicleImagePath(r.slug), // real photo where fetched, else "" (branded placeholder) until one is uploaded via /admin
      ratePerKm: r.ratePerKm ?? null, // only set where a real published rate was confirmed — never invented
      featured: r.featured,
      sortOrder: r.sortOrder
    });
  }
  console.log(`• seeded ${rows.length} vehicles`);
}

async function seedServices(): Promise<void> {
  if ((await servicesRepo.count()) > 0) {
    console.log("• services already seeded, skipping");
    return;
  }
  const rows = [
    { name: "Outstation Travel", slug: "outstation-travel", icon: "route", featured: 1,
      shortDescription: "The best outstation cab service in Bangalore — one-way and round-trip cabs for journeys beyond the city, with an upfront quotation before you travel.",
      description: "Whether you're heading to Coorg for the weekend or driving down to Goa for a longer break, our outstation service covers one-way drops and full round trips across Karnataka and neighbouring states. You choose the vehicle — sedan, SUV, Tempo Traveller or bus — and we take care of the driver, fuel and route planning.",
      highlights: ["One-way and round-trip options", "Experienced outstation drivers", "Karnataka & neighbouring states", "Upfront, itemised quotation"] },
    { name: "Airport Transfer", slug: "airport-transfer", icon: "plane", featured: 1,
      shortDescription: "Bangalore's reliable airport taxi and cab booking service — pickup and drop to Kempegowda International Airport, tracked against your flight timing.",
      description: "Flights don't wait, and neither should your cab. Our airport transfer service covers pickup and drop across Bangalore to and from Kempegowda International Airport, with drivers briefed on your flight time so you're neither rushed nor left waiting at arrivals.",
      highlights: ["Covers all Bangalore localities", "Flight-time aware scheduling", "Sedan to SUV options", "Meet-and-greet at arrivals on request"] },
    { name: "Local & Intercity Travel", slug: "local-intercity-travel", icon: "map-pin", featured: 1,
      shortDescription: "Hourly and per-kilometre packages for city errands, sightseeing and short intercity hops.",
      description: "For days when you need a car on standby — client visits across town, a full day of city sightseeing, or a short hop to a neighbouring town — our local and intercity packages are billed by hours and kilometres so you know the cost before you start.",
      highlights: ["8 hrs/80 km and 12 hrs/120 km packages", "Custom duration on request", "City sightseeing friendly", "Transparent per-km billing"] },
    { name: "Corporate Travel", slug: "corporate-travel", icon: "building", featured: 1,
      shortDescription: "Bangalore's dependable corporate cab service — transportation for employee commutes, client visits, offsites and corporate events.",
      description: "We work with businesses across Bangalore on both one-off bookings and recurring travel needs — airport pickups for visiting clients, staff transportation for offsites, and event-day logistics. Vehicles range from executive sedans to full coaches for large teams.",
      highlights: ["Executive sedans to full coaches", "Offsite & event-day logistics", "Recurring booking support", "Professionally presented drivers"] },
    { name: "Wedding Transportation", slug: "wedding-transportation", icon: "heart", featured: 1,
      shortDescription: "Bangalore's trusted wedding car rental — guest shuttles, family cars and decorated vehicles for wedding functions and baraat routes.",
      description: "From ferrying guests between the venue and hotels to arranging a well-presented car for the couple, our wedding transportation service is planned around your function schedule so every vehicle is in the right place at the right time.",
      highlights: ["Guest shuttle coordination", "Multi-vehicle event-day planning", "Decoration-ready car options", "Coordinated multi-day scheduling"] },
    { name: "Educational Tours", slug: "educational-tours", icon: "graduation-cap", featured: 0,
      shortDescription: "Buses and mini buses for school and college excursions, industrial visits and study tours.",
      description: "Educational institutions trust us for the added coordination that student travel requires — headcount-matched vehicles, punctual scheduling and drivers experienced with group student travel for day trips and multi-day educational tours alike.",
      highlights: ["Mini bus to full coach capacity", "Headcount-matched vehicle sizing", "Day trips & multi-day tours", "Coordination with faculty in-charge"] },
    { name: "Pilgrimage Tours", slug: "pilgrimage-tours", icon: "landmark", featured: 0,
      shortDescription: "Group vehicles for temple and pilgrimage circuits across Karnataka and neighbouring states.",
      description: "Pilgrimage travel often means early starts, multiple stops and larger families travelling together. Our Tempo Travellers and mini buses are well suited to popular circuits, with drivers familiar with common pilgrimage routes and timings.",
      highlights: ["Familiar with popular pilgrimage circuits", "Early-start scheduling", "Group-friendly vehicle sizes", "Multi-family travel coordination"] },
    { name: "Family Tours", slug: "family-tours", icon: "users", featured: 0,
      shortDescription: "Comfortable, well-paced vehicle options for family holidays and multi-generational trips.",
      description: "From grandparents to toddlers, family trips have different comfort needs than a solo business trip. We help you pick a vehicle with the right seating, luggage space and legroom so the whole family arrives relaxed, not cramped.",
      highlights: ["Seating suited to multi-generational groups", "Extra luggage space for holidays", "Flexible multi-stop itineraries", "Child-seat friendly cars on request"] },
    { name: "Resort Trips", slug: "resort-trips", icon: "mountain", featured: 0,
      shortDescription: "Round-trip cabs to resorts and getaway destinations around Bangalore for a day or a weekend.",
      description: "Whether it's a day trip to a resort near Bangalore or a weekend stay further out, we arrange round-trip transportation timed to your check-in and check-out, so you're not left arranging a return cab at the last minute.",
      highlights: ["Timed to check-in/check-out", "Day-trip and weekend options", "Popular resort belts covered", "Return-journey pre-booked"] },
    { name: "Customized Tours", slug: "customized-tours", icon: "sliders", featured: 1,
      shortDescription: "Build your own multi-day itinerary — we match the route, vehicle and pace to your group.",
      description: "Not every trip fits a standard package. Tell us your destinations, number of days and group size, and we'll put together a customised itinerary with a suitable vehicle, suggested routing and an upfront quotation for your review.",
      highlights: ["Fully custom itinerary planning", "Multi-destination routing", "Vehicle matched to group size", "No-obligation quotation"] },
    { name: "Group Transportation", slug: "group-transportation", icon: "users-group", featured: 0,
      shortDescription: "Coordinated multi-vehicle transportation for large groups, associations and community events.",
      description: "For groups too large for a single vehicle, we coordinate multiple cars, Tempo Travellers or buses to move together on a shared schedule, keeping the whole group's travel logistics simple to manage from one point of contact.",
      highlights: ["Multi-vehicle coordination", "Single point of contact", "Scales from 20 to 200+ travellers", "Suited to associations & community groups"] },
    { name: "Event Transportation", slug: "event-transportation", icon: "calendar", featured: 0,
      shortDescription: "On-time vehicle logistics for conferences, exhibitions, sports events and private functions.",
      description: "Event days run on tight schedules. We plan vehicle allocation and driver timing around your event agenda — guest arrivals, shuttle loops and return drops — so transportation is one less thing to manage on the day.",
      highlights: ["Agenda-based scheduling", "Guest shuttle loops", "Multi-vehicle event-day support", "Backup vehicle planning on request"] }
  ];

  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx]!;
    await servicesRepo.insert({
      name: r.name,
      slug: r.slug,
      icon: r.icon,
      shortDescription: r.shortDescription,
      description: r.description,
      highlights: JSON.stringify(r.highlights),
      imageKey: serviceImagePath(r.slug),
      featured: r.featured,
      sortOrder: idx + 1
    });
  }
  console.log(`• seeded ${rows.length} services`);
}

async function seedPackages(): Promise<void> {
  if ((await packagesRepo.count()) > 0) {
    console.log("• packages already seeded, skipping");
    return;
  }
  const rows = [
    { title: "Coorg Getaway", slug: "coorg-getaway", destination: "Coorg, Karnataka", travelCategory: "Hill Station",
      duration: "2 Days / 1 Night", idealFor: "Couples, small families and friend groups wanting a quick coffee-country escape",
      highlights: ["Coffee estate visit", "Abbey Falls / Iruppu Falls", "Raja's Seat viewpoint", "Local Kodava cuisine stop"],
      vehicleOptions: ["Sedan", "Innova Crysta", "9 Seater Tempo Traveller"],
      description: "A short, scenic drive from Bangalore into Karnataka's coffee country. This itinerary is built around Coorg's misty hills, waterfalls and coffee estates, with a relaxed pace suited to a weekend trip.", featured: 1, sortOrder: 1 },
    { title: "Ooty & Coonoor Hill Tour", slug: "ooty-coonoor-hill-tour", destination: "Ooty & Coonoor, Tamil Nadu", travelCategory: "Hill Station",
      duration: "3 Days / 2 Nights", idealFor: "Families and groups wanting a classic Nilgiris hill-station holiday",
      highlights: ["Botanical Garden & Ooty Lake", "Doddabetta Peak viewpoint", "Coonoor tea estates", "Nilgiri Mountain Railway (seasonal)"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "A longer hill-station break covering both Ooty and neighbouring Coonoor, with time built in for the region's gardens, viewpoints and tea estates rather than a rushed single-day loop.", featured: 1, sortOrder: 2 },
    { title: "Mysore Heritage Day Tour", slug: "mysore-heritage-day-tour", destination: "Mysore, Karnataka", travelCategory: "Heritage",
      duration: "1 Day", idealFor: "Day-trippers, heritage enthusiasts and families wanting a quick city break",
      highlights: ["Mysore Palace", "Chamundi Hills", "Brindavan Gardens", "Local silk & sandalwood shopping stop"],
      vehicleOptions: ["Sedan", "Maruti Ertiga", "Innova Crysta"],
      description: "A well-paced single-day loop from Bangalore covering Mysore's best-known heritage sites, timed to get you back home the same evening.", featured: 1, sortOrder: 3 },
    { title: "Chikmagalur Coffee Trails", slug: "chikmagalur-coffee-trails", destination: "Chikmagalur, Karnataka", travelCategory: "Hill Station",
      duration: "2 Days / 1 Night", idealFor: "Nature lovers, trekking groups and coffee-estate stay travellers",
      highlights: ["Mullayanagiri viewpoint", "Coffee estate walk", "Hebbe Falls (seasonal)", "Baba Budangiri hills"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "Karnataka's highest hill town, best known for its coffee estates and trekking trails — this itinerary balances a scenic drive with time for outdoor exploration.", featured: 0, sortOrder: 4 },
    { title: "Wayanad Nature Escape", slug: "wayanad-nature-escape", destination: "Wayanad, Kerala", travelCategory: "Wildlife & Nature",
      duration: "3 Days / 2 Nights", idealFor: "Wildlife enthusiasts, families and groups wanting a nature-focused break",
      highlights: ["Wayanad Wildlife Sanctuary", "Edakkal Caves", "Banasura Sagar Dam", "Chembra Peak viewpoint"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "A cross-border trip into Kerala's Wayanad district, built around its wildlife sanctuary, viewpoints and cooler forested landscape.", featured: 0, sortOrder: 5 },
    { title: "Hampi Heritage Trail", slug: "hampi-heritage-trail", destination: "Hampi, Karnataka", travelCategory: "Heritage",
      duration: "2 Days / 1 Night", idealFor: "History and architecture enthusiasts, photography groups",
      highlights: ["Virupaksha Temple", "Vittala Temple & Stone Chariot", "Hampi Bazaar ruins", "Sunset at Matanga Hill"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller", "25 Seater Mini Bus"],
      description: "A UNESCO World Heritage site and one of Karnataka's most rewarding heritage trips, covering the ruins of the Vijayanagara Empire at a comfortable, unhurried pace.", featured: 1, sortOrder: 6 },
    { title: "Goa Beach Holiday", slug: "goa-beach-holiday", destination: "Goa", travelCategory: "Beach",
      duration: "4 Days / 3 Nights", idealFor: "Friend groups, couples and families wanting a beach holiday",
      highlights: ["North & South Goa beach circuit", "Old Goa churches", "Local seafood trail", "Flexible free-day for leisure"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller", "Luxury Tempo Traveller"],
      description: "A longer road trip itinerary to Goa with a mixed pace — sightseeing on the way in, and enough free time once there to enjoy the beaches at your own speed.", featured: 0, sortOrder: 7 },
    { title: "Kerala Backwaters Tour", slug: "kerala-backwaters-tour", destination: "Alleppey & Kumarakom, Kerala", travelCategory: "Backwaters",
      duration: "4 Days / 3 Nights", idealFor: "Couples, families and groups wanting a backwaters and houseboat experience",
      highlights: ["Alleppey houseboat stay (optional add-on)", "Kumarakom backwaters", "Local spice plantation visit", "Fort Kochi day trip (optional)"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "A Kerala road trip centred on the backwaters of Alleppey and Kumarakom, with the itinerary flexible enough to add a houseboat stay or a Fort Kochi extension.", featured: 1, sortOrder: 8 },
    { title: "Tirupati Pilgrimage Tour", slug: "tirupati-pilgrimage-tour", destination: "Tirupati, Andhra Pradesh", travelCategory: "Pilgrimage",
      duration: "2 Days / 1 Night", idealFor: "Families and groups travelling for darshan at Tirumala",
      highlights: ["Tirumala temple darshan scheduling", "Overnight halt near Tirupati", "Return via Sri Kalahasti (optional)"],
      vehicleOptions: ["Sedan", "Innova Crysta", "9 Seater Tempo Traveller"],
      description: "A straightforward pilgrimage itinerary from Bangalore to Tirupati with an overnight halt, timed around typical darshan queues rather than a rushed same-day dash.", featured: 0, sortOrder: 9 },
    { title: "Dharmasthala & Kukke Subramanya Pilgrimage", slug: "dharmasthala-kukke-pilgrimage", destination: "Dharmasthala & Kukke Subramanya, Karnataka", travelCategory: "Pilgrimage",
      duration: "2 Days / 1 Night", idealFor: "Families and pilgrimage groups covering multiple temple towns",
      highlights: ["Dharmasthala Manjunatha Temple", "Kukke Subramanya Temple", "Scenic Western Ghats driving route"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller", "20 Seater Mini Bus"],
      description: "A two-temple pilgrimage circuit through Karnataka's Western Ghats, popular with multi-family groups travelling together for darshan at both Dharmasthala and Kukke Subramanya.", featured: 0, sortOrder: 10 },
    { title: "Kodaikanal Hill Escape", slug: "kodaikanal-hill-escape", destination: "Kodaikanal, Tamil Nadu", travelCategory: "Hill Station",
      duration: "3 Days / 2 Nights", idealFor: "Families and couples wanting a classic South Indian hill-station holiday",
      highlights: ["Kodai Lake boating", "Coaker's Walk viewpoint", "Pillar Rocks", "Bryant Park"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "A well-loved hill station on the southern edge of the Palani Hills, this itinerary is paced around Kodaikanal's lake, viewpoints and cool-climate gardens.", featured: 0, sortOrder: 11 },
    { title: "Munnar Tea Garden Trail", slug: "munnar-tea-garden-trail", destination: "Munnar, Kerala", travelCategory: "Hill Station",
      duration: "3 Days / 2 Nights", idealFor: "Nature lovers and couples wanting a tea-estate hill holiday",
      highlights: ["Tea plantation walk", "Eravikulam National Park", "Mattupetty Dam", "Top Station viewpoint"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "Kerala's best-known tea country, with rolling estate views, a cooler climate and a slower pace than the coast — this itinerary leaves room to actually enjoy it rather than rush through.", featured: 1, sortOrder: 12 },
    { title: "Trivandrum & Kovalam Beach Tour", slug: "trivandrum-kovalam-beach-tour", destination: "Trivandrum, Kerala", travelCategory: "Beach",
      duration: "3 Days / 2 Nights", idealFor: "Families and couples wanting a capital-city and beach combination",
      highlights: ["Kovalam Lighthouse Beach", "Napier Museum", "Shankumugham Beach", "Local heritage sites"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "Kerala's capital paired with the beaches of Kovalam — a mix of city sightseeing and coastal downtime on the same trip.", featured: 0, sortOrder: 13 },
    { title: "Mantralaya Pilgrimage Tour", slug: "mantralaya-pilgrimage-tour", destination: "Mantralaya, Andhra Pradesh", travelCategory: "Pilgrimage",
      duration: "2 Days / 1 Night", idealFor: "Devotees travelling for darshan at the Sri Raghavendra Swamy Mutt",
      highlights: ["Mantralaya Mutt darshan", "Tungabhadra riverside", "Nearby temple stops"],
      vehicleOptions: ["Sedan", "Innova Crysta", "9 Seater Tempo Traveller"],
      description: "A focused pilgrimage itinerary to Mantralaya, timed around darshan hours with a comfortable overnight halt rather than a rushed same-day round trip.", featured: 0, sortOrder: 14 },
    { title: "Pondicherry Heritage & Beach Tour", slug: "pondicherry-heritage-beach-tour", destination: "Pondicherry", travelCategory: "Heritage",
      duration: "3 Days / 2 Nights", idealFor: "Couples and friend groups wanting a French-quarter heritage and beach mix",
      highlights: ["French Quarter walk", "Auroville", "Promenade Beach", "Sri Aurobindo Ashram (exterior)"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "Pondicherry's French Quarter, beachfront promenade and Auroville make it one of the more distinctive heritage trips from Bangalore — this itinerary balances walking and driving time evenly.", featured: 1, sortOrder: 15 },
    { title: "Rameshwaram Pilgrimage Tour", slug: "rameshwaram-pilgrimage-tour", destination: "Rameshwaram, Tamil Nadu", travelCategory: "Pilgrimage",
      duration: "2 Days / 1 Night", idealFor: "Pilgrimage groups and families visiting one of the char dham sites",
      highlights: ["Ramanathaswamy Temple darshan", "Pamban Bridge", "Dhanushkodi"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller", "20 Seater Mini Bus"],
      description: "A pilgrimage trip to Rameshwaram covering the Ramanathaswamy Temple and the dramatic Pamban Bridge and Dhanushkodi coastline, paced for group and family travel.", featured: 0, sortOrder: 16 },
    { title: "Kanyakumari Tour", slug: "kanyakumari-tour", destination: "Kanyakumari, Tamil Nadu", travelCategory: "Beach",
      duration: "2 Days / 1 Night", idealFor: "Travellers wanting to see India's southern tip",
      highlights: ["Vivekananda Rock Memorial", "Thiruvalluvar Statue", "Sunrise & sunset viewpoint", "Kanyakumari beach"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "India's southernmost point, where the Arabian Sea, Bay of Bengal and Indian Ocean meet — this itinerary is timed to catch the well-known sunrise or sunset view.", featured: 1, sortOrder: 17 },
    { title: "Gokarna Beach Getaway", slug: "gokarna-beach-getaway", destination: "Gokarna, Karnataka", travelCategory: "Beach",
      duration: "2 Days / 1 Night", idealFor: "Friend groups wanting a laid-back coastal Karnataka trip",
      highlights: ["Om Beach", "Kudle Beach", "Mahabaleshwar Temple", "Coastal drive"],
      vehicleOptions: ["Sedan", "Innova Crysta", "9 Seater Tempo Traveller"],
      description: "Karnataka's own coastal getaway — a quieter, less built-up alternative to Goa, with a string of beaches within easy reach of each other.", featured: 1, sortOrder: 18 },
    { title: "Nandi Hills Sunrise Trip", slug: "nandi-hills-sunrise-trip", destination: "Nandi Hills, Karnataka", travelCategory: "Hill Station",
      duration: "1 Day (early morning)", idealFor: "A quick early-morning getaway close to Bangalore",
      highlights: ["Sunrise viewpoint", "Tipu's Drop", "Bhoga Nandeeshwara Temple"],
      vehicleOptions: ["Sedan", "Maruti Ertiga", "Innova Crysta"],
      description: "The closest hill escape to Bangalore, popular as an early-morning sunrise trip — we time pickup to get you there well before daybreak.", featured: 0, sortOrder: 19 },
    { title: "Sakleshpur & Western Ghats Trail", slug: "sakleshpur-western-ghats-trail", destination: "Sakleshpur, Karnataka", travelCategory: "Wildlife & Nature",
      duration: "2 Days / 1 Night", idealFor: "Nature and trekking groups wanting a Western Ghats escape",
      highlights: ["Manjarabad Fort", "Coffee estate trail", "Bisle viewpoint", "Western Ghats scenery"],
      vehicleOptions: ["Innova Crysta", "9 Seater Tempo Traveller"],
      description: "A Western Ghats trip built around Sakleshpur's star-shaped fort, coffee estates and forest viewpoints — a good fit for smaller nature-focused groups.", featured: 0, sortOrder: 20 }
  ];

  for (const r of rows) {
    await packagesRepo.insert({
      title: r.title,
      slug: r.slug,
      destination: r.destination,
      travelCategory: r.travelCategory,
      duration: r.duration,
      startLocation: "Bangalore",
      idealFor: r.idealFor,
      highlights: JSON.stringify(r.highlights),
      vehicleOptions: JSON.stringify(r.vehicleOptions),
      description: r.description,
      imageKey: destinationImagePath(r.slug),
      featured: r.featured,
      sortOrder: r.sortOrder
    });
  }
  console.log(`• seeded ${rows.length} tour packages`);
}

async function seedFaqs(): Promise<void> {
  if ((await faqsRepo.count()) > 0) {
    console.log("• faqs already seeded, skipping");
    return;
  }
  const rows: Array<{ q: string; a: string; category: string }> = [
    { q: "How do I book a vehicle with Yogi Tours & Travels?", category: "Booking",
      a: "Use the booking widget on our homepage, call or WhatsApp us directly, or fill in the enquiry form on any vehicle, service or tour package page. We'll confirm vehicle availability and share a quotation before you make any payment." },
    { q: "Which is the best tours and travels company in Bangalore?", category: "About",
      a: "Yogi Tours & Travels is a highly-rated Bangalore tours and travels agency — rated 4.9 out of 5 from 210+ Google reviews. We operate a full range of vehicles, from compact sedans and Toyota Innova Crysta to Tempo Travellers, mini buses and tourist buses, with the per-km rate, minimum daily kilometres and driver Bata shared upfront in every quotation. The best fit depends on your group size, route and budget, so our team confirms the right vehicle for your trip when you enquire." },
    { q: "Is Yogi Tours & Travels reliable and trustworthy?", category: "About",
      a: "Yes — Yogi Tours & Travels is rated 4.9 out of 5 from 210+ Google reviews, operates 24 hours, and every quotation states the per-km rate, minimum daily kilometres, driver Bata and duty timing upfront, so there are no surprises during the trip. Tolls, parking, permits and state taxes are the only additions, and those are flagged in advance too." },
    { q: "What areas does Yogi Tours & Travels serve in Bangalore?", category: "About",
      a: "We serve all of Bangalore, including Whitefield, Electronic City, Koramangala, HSR Layout, Jayanagar, JP Nagar, Indiranagar, Yelahanka, Hebbal, Marathahalli and Rajajinagar, along with outstation trips across Karnataka and South India — Coorg, Mysore, Chikmagalur, Goa, Kerala and beyond." },
    { q: "Is there a tours and travels near me in Bangalore?", category: "About",
      a: "Yes — Yogi Tours & Travels operates across all of Bangalore, so wherever you are in the city, there is a pickup point near you. We cover Whitefield, Electronic City, Koramangala, HSR Layout, Jayanagar, JP Nagar, Indiranagar, Yelahanka, Hebbal, Marathahalli and Rajajinagar directly, and can arrange pickup from any other Bangalore locality on request." },
    { q: "How do I contact Yogi Tours & Travels?", category: "About",
      a: "Call or WhatsApp us anytime — we operate 24 hours a day. You can also reach us through the enquiry form on this website for a free, no-obligation quotation." },
    { q: "Do you provide airport transfers in Bangalore?", category: "Services",
      a: "Yes. We offer pickup and drop to Kempegowda International Airport across Bangalore, with drivers briefed on your flight timing for both arrivals and departures." },
    { q: "Do you provide vehicles for outstation trips?", category: "Services",
      a: "Yes. Our outstation service covers destinations across Karnataka and neighbouring states, with sedans, SUVs, Tempo Travellers and buses available depending on your group size." },
    { q: "Do you offer one-way outstation trips?", category: "Booking",
      a: "Yes, one-way drops are available on most outstation routes. Select “One Way” in the booking widget's trip type field and we'll quote accordingly." },
    { q: "Do you offer round trip packages?", category: "Booking",
      a: "Yes. Round trips are our most common outstation booking type, with the vehicle and driver staying with you for the full itinerary until you're dropped back." },
    { q: "Can I book a Tempo Traveller for a group?", category: "Fleet",
      a: "Yes. We offer 9, 12 and 17 seater Tempo Travellers, including the Force Urbania, suited to family groups, pilgrimage trips and corporate outings." },
    { q: "Do you provide buses for weddings?", category: "Services",
      a: "Yes. We arrange guest shuttles, family cars and multi-vehicle transportation planned around your wedding function schedule — see our Wedding Transportation service for details." },
    { q: "Do you provide vehicles for corporate transportation?", category: "Services",
      a: "Yes. We support both one-off corporate bookings (client visits, airport pickups) and recurring needs like offsite transportation and event-day logistics, with vehicles ranging from executive sedans to full coaches." },
    { q: "Can I customize a tour package?", category: "Tour Packages",
      a: "Yes. Every package listed on our site can be adjusted for duration, stops and vehicle type. Use the “Request Package” button or contact us with your requirements and we'll tailor an itinerary." },
    { q: "What is included in the quotation?", category: "Pricing",
      a: "Our quotations are itemised to show the vehicle category, estimated distance/duration charges, driver allowance and applicable taxes, so you know what you're paying for before confirming." },
    { q: "Are tolls and parking included in the quote?", category: "Pricing",
      a: "Toll charges, parking fees and interstate permit charges (where applicable) are typically billed separately, at actuals. This is confirmed clearly in your quotation before you book." },
    { q: "Can I request a specific vehicle?", category: "Fleet",
      a: "You're welcome to request a specific vehicle category or model when enquiring. We'll confirm availability for your travel dates and let you know if a suitable alternative is needed." },
    { q: "How early should I book?", category: "Booking",
      a: "For local and airport transfers, a few hours' notice is usually enough. For outstation trips, weekend getaways and larger vehicles (Tempo Travellers, mini buses, tourist buses), we recommend booking at least 2–3 days in advance, and earlier during festival or peak travel season." },
    { q: "Do you provide vehicles for school or college educational tours?", category: "Services",
      a: "Yes. We work with educational institutions on day trips and multi-day educational tours, with mini buses and tourist buses sized to match student headcounts and coordinated with faculty in-charge." },
    { q: "What safety measures are followed during trips?", category: "Safety",
      a: "Our drivers are experienced with the routes they operate, vehicles undergo regular maintenance checks, and we share driver and vehicle details ahead of every trip so you know exactly who is picking you up." }
  ];
  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx]!;
    await faqsRepo.insert({ question: r.q, answer: r.a, category: r.category, sortOrder: idx + 1 });
  }
  console.log(`• seeded ${rows.length} faqs`);
}

async function seedTestimonials(): Promise<void> {
  if ((await testimonialsRepo.count()) > 0) {
    console.log("• testimonials already seeded, skipping");
    return;
  }
  const rows = [
    { name: "Ramesh K.", rating: 5, tripType: "Family Trip to Coorg", review: "Booking was straightforward and the driver was on time on both days of our trip." },
    { name: "Ananya S.", rating: 5, tripType: "Airport Transfer", review: "The cab arrived well ahead of my flight and the driver kept track of the timing closely." },
    { name: "Deepak R.", rating: 4, tripType: "Corporate Offsite", review: "Coordinated well for a 20-person team offsite — the mini bus was clean and the driver knew the route." },
    { name: "Priya M.", rating: 5, tripType: "Wedding Transportation", review: "Multiple vehicles were arranged smoothly across two wedding function days without any last-minute issues." },
    { name: "Suresh N.", rating: 5, tripType: "Outstation to Hampi", review: "Comfortable Tempo Traveller for our group trip, with good communication throughout the booking." },
    { name: "Kavitha J.", rating: 4, tripType: "Group Pilgrimage Tour", review: "The driver was familiar with the temple route and timings, which made the whole day easier to plan around." }
  ];
  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx]!;
    await testimonialsRepo.insert({
      name: r.name,
      rating: r.rating,
      review: r.review,
      tripType: r.tripType,
      isPlaceholder: 1,
      sortOrder: idx + 1
    });
  }
  console.log(`• seeded ${rows.length} placeholder testimonials (clearly marked isPlaceholder=1)`);
}

async function seedGallery(): Promise<void> {
  if ((await galleryRepo.count()) > 0) {
    console.log("• gallery already seeded, skipping");
    return;
  }
  const cats: GalleryCategory[] = ["Vehicles", "Tours", "Group Travel", "Corporate", "Weddings", "Destinations"];
  let sortOrder = 1;
  const rows: Array<{ category: GalleryCategory; caption: string; altText: string }> = [];
  const items: Record<GalleryCategory, Array<{ key: string; caption: string; alt: string; photo?: string }>> = {
    Vehicles: [
      { key: "gallery-vehicle-innova-crysta", caption: "Innova Crysta ready for an outstation trip", alt: "Innova Crysta parked and ready for a Bangalore outstation trip" },
      { key: "gallery-vehicle-tempo-traveller", caption: "9 Seater Tempo Traveller for group travel", alt: "9 seater Tempo Traveller used for group travel from Bangalore", photo: "tempo-traveller-exterior-view.jpg" },
      { key: "gallery-vehicle-tourist-bus", caption: "Tourist bus prepared for a group tour", alt: "Tourist bus prepared for a large group tour departure", photo: "tour-coach-exterior-view.jpg" }
    ],
    Tours: [
      { key: "gallery-tour-coorg", caption: "Coffee estate stop during a Coorg tour", alt: "Coffee estate stop on a Coorg tour from Bangalore" },
      { key: "gallery-tour-hampi", caption: "Heritage sightseeing stop in Hampi", alt: "Heritage sightseeing stop during a Hampi tour" },
      { key: "gallery-tour-ooty", caption: "Hill-station drive on the Ooty route", alt: "Scenic hill-station drive on the way to Ooty", photo: "ooty-tea-garden-panorama-01.jpg" }
    ],
    "Group Travel": [
      { key: "gallery-group-college", caption: "College friend group on an outstation trip", alt: "College friend group boarding a Tempo Traveller for an outstation trip" },
      { key: "gallery-group-family", caption: "Extended family group travelling together", alt: "Extended family group travelling together for a weekend trip" },
      { key: "gallery-group-pilgrimage", caption: "Pilgrimage group departure", alt: "Pilgrimage group departing for a temple tour" }
    ],
    Corporate: [
      { key: "gallery-corporate-offsite", caption: "Corporate team departing for an offsite", alt: "Corporate team boarding a mini bus for a company offsite" },
      { key: "gallery-corporate-event", caption: "Event-day transportation coordination", alt: "Event-day transportation coordination for a corporate event" },
      { key: "gallery-corporate-airport", caption: "Executive airport pickup", alt: "Executive sedan arranged for a corporate airport pickup" }
    ],
    Weddings: [
      { key: "gallery-wedding-car", caption: "Decorated car for the wedding couple", alt: "Decorated wedding car arranged for the couple" },
      { key: "gallery-wedding-guests", caption: "Guest shuttle for a wedding function", alt: "Guest shuttle vehicle arranged for a wedding function" },
      { key: "gallery-wedding-baraat", caption: "Multi-vehicle coordination for a wedding event", alt: "Multiple vehicles coordinated for a wedding event day" }
    ],
    Destinations: [
      { key: "gallery-destination-chikmagalur", caption: "Misty hills of Chikmagalur", alt: "Misty hills and coffee estates in Chikmagalur" },
      { key: "gallery-destination-goa", caption: "Coastal stop on a Goa road trip", alt: "Coastal stop during a Goa road trip from Bangalore" },
      { key: "gallery-destination-kerala", caption: "Backwaters of Kerala", alt: "Backwaters near Alleppey, Kerala" }
    ]
  };
  for (const cat of cats) {
    for (const item of items[cat]) {
      rows.push({ category: cat, caption: item.caption, altText: item.alt });
    }
  }
  for (const r of rows) {
    // No real photo yet (imageKey: "") — smart-image.ejs shows a branded
    // placeholder, seeded by the row's own id (set via generic-list.ejs's
    // edit/re-order flow) rather than a fake path string.
    await galleryRepo.insert({ category: r.category, imageKey: "", caption: r.caption, altText: r.altText, sortOrder: sortOrder++ });
  }
  console.log(`• seeded ${rows.length} gallery items`);
}

async function seedBlog(): Promise<void> {
  if ((await blogRepo.count()) > 0) {
    console.log("• blog posts already seeded, skipping");
    return;
  }
  const rows = [
    {
      title: "A Karnataka to Gujarat Road Trip: Driving to the Statue of Unity",
      slug: "karnataka-to-gujarat-road-trip-statue-of-unity",
      excerpt: "What a genuine 1,500 km outstation drive from Bangalore to the Statue of Unity in Gujarat looks like — the route through Maharashtra, the arrival at Kevadia, and which vehicle actually suits a trip this long.",
      coverImageKey: "/assets/images/blog/gujarat-blog-4.webp",
      content: `<p>Most of the routes we write about start and end within a day's drive of Bangalore — Coorg, Mysore, Chikmagalur. This one didn't. A recent outstation booking took a Yogi Tours &amp; Travels vehicle over 1,500 km north from Karnataka to Kevadia in Gujarat, home to the Statue of Unity — the 182-metre statue of Sardar Vallabhbhai Patel overlooking the Narmada river and the Sardar Sarovar Dam. It's one of the longer drives we plan for, and a good example of what a genuine multi-day outstation trip from Bangalore actually involves.</p>

<h2>The route: Karnataka to Gujarat</h2>
<p>The drive north runs through Karnataka into Maharashtra — past Pune and Nashik — before crossing into Gujarat via Surat and Vadodara, then on to Kevadia in Narmada district. At around 1,500 km one-way, it's not a route we'd ever suggest doing in one push. Groups typically split it into two driving days with an overnight halt in Maharashtra, arriving in Kevadia fresh enough to actually enjoy the site rather than just collapse at the hotel.</p>

<img src="/assets/images/blog/gujarat-blog-2.webp" alt="Hillside 'Statue of Unity' signage overlooking the Narmada river valley, Gujarat" loading="lazy" />
<figcaption>The valley approach to the Statue of Unity, with the Narmada river below.</figcaption>

<h2>Arriving at the Statue of Unity</h2>
<p>Nothing about the drive quite prepares you for the scale of it up close — at 182 metres, it's the tallest statue in the world, and it's visible from well before you reach the viewing gallery. The site sits right on the Narmada, with the Sardar Sarovar Dam nearby, so the statue, the river and the surrounding hills of the Satpura and Vindhya ranges all frame each other rather than competing.</p>

<img src="/assets/images/blog/gujarat-blog-1.webp" alt="The Statue of Unity viewed from the visitor viewing gallery, Kevadia, Gujarat" loading="lazy" />
<figcaption>The viewing gallery deck, with the statue rising directly above.</figcaption>

<img src="/assets/images/blog/gujarat-blog-5.webp" alt="Full view of the Statue of Unity against a cloudy sky, Gujarat" loading="lazy" />

<h2>What kind of trip is this?</h2>
<p>A drive this long isn't an airport-transfer booking — it's closer to how we plan a <a href="/services/outstation-travel">multi-day outstation trip</a>, with route planning, overnight stops and a vehicle built for long hours on the highway rather than short city hops. For a trip like this, we'd typically suggest an <a href="/fleet/car/innova-crysta">Innova Crysta</a> for a small family or friend group, or a <a href="/fleet/tempo-traveller">Tempo Traveller</a> if you're travelling as a larger group and want everyone on one vehicle for the full two-day drive each way.</p>

<img src="/assets/images/blog/gujarat-blog-3.webp" alt="Narmada river valley near the Statue of Unity, Gujarat" loading="lazy" />

<h2>Is it worth the drive from Bangalore?</h2>
<p>If Gujarat is one stop on a longer North India itinerary, flying makes more sense. But for a dedicated trip built specifically around the Statue of Unity — with the freedom to stop, detour and set your own pace across two full days of highway — a booked outstation vehicle from Bangalore is a genuinely practical way to do it, not just a scenic alternative to flying.</p>

<img src="/assets/images/blog/gujarat-blog-6.webp" alt="Statue of Unity and the surrounding viewing plaza at Kevadia, Gujarat" loading="lazy" />

<p>Planning a long-distance outstation trip from Bangalore — whether it's Gujarat or somewhere closer? <a href="/contact">Get in touch</a> and we'll help you plan the route and pick the right vehicle for it.</p>`,
      author: "Yogi Tours & Travels", sortOrder: 1
    }
  ];
  for (const r of rows) {
    await blogRepo.insert({
      title: r.title, slug: r.slug, excerpt: r.excerpt, content: r.content,
      coverImageKey: r.coverImageKey, author: r.author, published: 1,
      publishedAt: new Date().toISOString().replace("T", " ").slice(0, 19), sortOrder: r.sortOrder
    });
  }
  console.log(`• seeded ${rows.length} blog posts`);
}

async function seedAdmin(): Promise<void> {
  if ((await adminUserCount()) > 0) {
    console.log("• admin user already exists, skipping (use the admin panel to change password)");
    return;
  }
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "change-this-password";
  const hash = bcrypt.hashSync(password, 10);
  await createAdminUser(username, hash);
  console.log(`• created admin user "${username}" from .env (change ADMIN_PASSWORD before going live)`);
}

async function run(): Promise<void> {
  console.log("Seeding database...");
  await initSchema();
  try {
    await seedVehicles();
    await seedServices();
    await seedPackages();
    await seedFaqs();
    await seedTestimonials();
    await seedGallery();
    await seedBlog();
    await seedAdmin();
    console.log("Seed complete.");
  } catch (err) {
    console.error("Seed failed (tables already inserted before the error are NOT rolled back — rerunning is safe, each seed function skips tables that already have rows):", err);
    process.exitCode = 1;
  }
  process.exit(process.exitCode ?? 0);
}

run();
