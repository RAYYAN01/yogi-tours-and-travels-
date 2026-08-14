// Route landing pages — "Bangalore to X" outstation route guides. Static
// data: distance/travel-time are well-established public road-distance
// facts (approximate, since actual figures vary by exact pickup point and
// route taken), never fabricated. No fares are published here — only the
// existing confirmed per-km rates already shown on vehicle pages.

export interface TripRoute {
  slug: string;
  destination: string;
  state: string;
  distanceKm: number;
  travelTimeHours: string;
  highlights: string[];
  intro: string;
  vehicleSlugs: Array<{ category: string; slug: string; label: string }>;
}

export const TRIP_ROUTES: TripRoute[] = [
  {
    slug: "bangalore-to-mysore-cab",
    destination: "Mysore",
    state: "Karnataka",
    distanceKm: 145,
    travelTimeHours: "3–3.5 hours",
    highlights: ["Mysore Palace", "Chamundi Hills", "Brindavan Gardens"],
    intro:
      "Mysore is one of the most-booked routes from Bangalore, usually travelled via NH275 through Mandya and Srirangapatna. It suits both a full-day round trip and an overnight stay, and is a common choice for heritage sightseeing and family weekend trips.",
    vehicleSlugs: [
      { category: "car", slug: "toyota-innova", label: "Toyota Innova" },
      { category: "car", slug: "innova-crysta", label: "Toyota Innova Crysta" },
      { category: "tempo-traveller", slug: "tempo-traveller-12-seater", label: "9 Seater Tempo Traveller" }
    ]
  },
  {
    slug: "bangalore-to-coorg-cab",
    destination: "Coorg",
    state: "Karnataka",
    distanceKm: 255,
    travelTimeHours: "5.5–6 hours",
    highlights: ["Abbey Falls", "Raja's Seat", "Coffee plantations"],
    intro:
      "Coorg (Madikeri) is a popular hill-station weekend getaway from Bangalore, reached via Mysore and Kushalnagar. Hill roads through the Western Ghats mean the return leg can take slightly longer than the outbound drive, so most travellers book it as a 2-day round trip.",
    vehicleSlugs: [
      { category: "car", slug: "innova-crysta", label: "Toyota Innova Crysta" },
      { category: "tempo-traveller", slug: "tempo-traveller-12-seater", label: "9 Seater Tempo Traveller" },
      { category: "tempo-traveller", slug: "force-urbania", label: "Force Urbania" }
    ]
  },
  {
    slug: "bangalore-to-ooty-cab",
    destination: "Ooty",
    state: "Tamil Nadu",
    distanceKm: 275,
    travelTimeHours: "6.5–7 hours",
    highlights: ["Ooty Lake", "Botanical Gardens", "Doddabetta Peak"],
    intro:
      "Ooty is reached via Mysore and Bandipur/Mudumalai, with a ghat-road climb through Tamil Nadu forest checkposts near the border. Because of the ghat section and forest-gate timing restrictions on some routes, most travellers plan this as a multi-day trip rather than a single-day round trip.",
    vehicleSlugs: [
      { category: "car", slug: "innova-crysta", label: "Toyota Innova Crysta" },
      { category: "tempo-traveller", slug: "tempo-traveller-12-seater", label: "9 Seater Tempo Traveller" }
    ]
  },
  {
    slug: "bangalore-to-chikmagalur-cab",
    destination: "Chikmagalur",
    state: "Karnataka",
    distanceKm: 245,
    travelTimeHours: "5.5 hours",
    highlights: ["Mullayanagiri Peak", "Baba Budangiri", "Coffee estates"],
    intro:
      "Chikmagalur's coffee-estate hills are typically reached via Hassan or Kunigal, and it's a common weekend or long-weekend trip for both families and small friend groups. The route mostly runs on state highways with a shorter ghat stretch than Coorg or Ooty.",
    vehicleSlugs: [
      { category: "car", slug: "toyota-innova", label: "Toyota Innova" },
      { category: "tempo-traveller", slug: "tempo-traveller-12-seater", label: "9 Seater Tempo Traveller" }
    ]
  },
  {
    slug: "bangalore-to-hampi-cab",
    destination: "Hampi",
    state: "Karnataka",
    distanceKm: 345,
    travelTimeHours: "6.5–7 hours",
    highlights: ["Virupaksha Temple", "Vittala Temple", "Hampi boulders"],
    intro:
      "Hampi is a longer outstation drive from Bangalore, usually via Chitradurga and Hospet on NH48. Given the distance, most travellers book this as a 2-day round trip or a one-way drop, especially for heritage and photography-focused visits.",
    vehicleSlugs: [
      { category: "car", slug: "innova-crysta", label: "Toyota Innova Crysta" },
      { category: "tempo-traveller", slug: "tempo-traveller-12-seater", label: "9 Seater Tempo Traveller" }
    ]
  },
  {
    slug: "bangalore-to-tirupati-cab",
    destination: "Tirupati",
    state: "Andhra Pradesh",
    distanceKm: 255,
    travelTimeHours: "5.5–6 hours",
    highlights: ["Tirumala Venkateswara Temple", "Kapila Theertham"],
    intro:
      "Tirupati is one of the most frequently booked pilgrimage routes from Bangalore, travelled via Chittoor on NH71/NH716. Early starts are common so travellers can complete the temple darshan and drive back the same day or the next.",
    vehicleSlugs: [
      { category: "car", slug: "toyota-innova", label: "Toyota Innova" },
      { category: "tempo-traveller", slug: "tempo-traveller-12-seater", label: "9 Seater Tempo Traveller" },
      { category: "tempo-traveller", slug: "maharaja-tempo-traveller", label: "Maharaja Tempo Traveller" }
    ]
  },
  {
    slug: "bangalore-to-pondicherry-cab",
    destination: "Pondicherry",
    state: "Puducherry",
    distanceKm: 315,
    travelTimeHours: "6.5–7 hours",
    highlights: ["French Quarter", "Promenade Beach", "Auroville"],
    intro:
      "Pondicherry is reached via Krishnagiri and Tiruvannamalai or via Chennai, and is a popular beach-and-heritage weekend trip. Given the distance, it's typically booked as a 2–3 day round trip rather than a single-day drive.",
    vehicleSlugs: [
      { category: "car", slug: "innova-crysta", label: "Toyota Innova Crysta" },
      { category: "tempo-traveller", slug: "force-urbania", label: "Force Urbania" }
    ]
  },
  {
    slug: "bangalore-to-chennai-cab",
    destination: "Chennai",
    state: "Tamil Nadu",
    distanceKm: 345,
    travelTimeHours: "6–6.5 hours",
    highlights: ["Marina Beach", "Chennai IT corridor"],
    intro:
      "Chennai is a well-travelled corporate and family route from Bangalore via NH44, largely on national highway with minimal ghat sections, making it one of the more predictable long-distance drives we handle.",
    vehicleSlugs: [
      { category: "car", slug: "toyota-innova", label: "Toyota Innova" },
      { category: "car", slug: "innova-crysta", label: "Toyota Innova Crysta" },
      { category: "tempo-traveller", slug: "force-urbania", label: "Force Urbania" }
    ]
  },
  {
    slug: "bangalore-to-hyderabad-cab",
    destination: "Hyderabad",
    state: "Telangana",
    distanceKm: 570,
    travelTimeHours: "9.5–10 hours",
    highlights: ["Charminar", "Golconda Fort", "Hussain Sagar"],
    intro:
      "Hyderabad is our longest regularly booked outstation route, travelled via NH44 through Anantapur and Kurnool. Given the distance, this is almost always a one-way drop or a multi-day round trip rather than a same-day return.",
    vehicleSlugs: [
      { category: "car", slug: "innova-crysta", label: "Toyota Innova Crysta" },
      { category: "tempo-traveller", slug: "force-urbania", label: "Force Urbania" }
    ]
  },
  {
    slug: "bangalore-to-mangalore-cab",
    destination: "Mangalore",
    state: "Karnataka",
    distanceKm: 355,
    travelTimeHours: "7.5–8 hours",
    highlights: ["Panambur Beach", "Kadri Manjunath Temple", "Western Ghats route"],
    intro:
      "Mangalore is reached either via Hassan and the Shiradi Ghat or via Sakleshpur, both routes crossing the Western Ghats. Road conditions through the ghat sections can add time in the monsoon, so this route is best planned with some schedule flexibility.",
    vehicleSlugs: [
      { category: "car", slug: "innova-crysta", label: "Toyota Innova Crysta" },
      { category: "tempo-traveller", slug: "tempo-traveller-12-seater", label: "9 Seater Tempo Traveller" }
    ]
  }
];

export function findTripRoute(slug: string): TripRoute | undefined {
  return TRIP_ROUTES.find((r) => r.slug === slug);
}
