// Location-based landing pages — one per Bangalore locality the business
// serves. Static, hand-written content (not DB-backed) since these don't
// need admin editing and must stay genuinely distinct per area, not a
// find-and-replace of the same paragraph with a swapped place name.

export interface LocationPage {
  slug: string;
  name: string;
  /** Real, verifiable landmarks/character notes — never invented business claims. */
  landmarks: string[];
  intro: string;
  /**
   * A second, genuinely distinct paragraph — real, verifiable geography and
   * traffic-pattern context specific to this locality (road names, junctions,
   * typical drive-time factors), not a template sentence with the area name
   * swapped in. Added because the location pages were flagged as near-
   * duplicate content by Google (86%+ identical across pages) — this is the
   * actual fix, not a cosmetic one.
   */
  detail: string;
  nearbySlugs: string[];
}

export const LOCATIONS: LocationPage[] = [
  {
    slug: "whitefield",
    name: "Whitefield",
    landmarks: ["ITPL", "Phoenix Marketcity", "Prestige Shantiniketan", "Whitefield Railway Station"],
    intro:
      "Whitefield is Bangalore's largest IT corridor, home to ITPL and a dense cluster of tech campuses, residential layouts and malls along Whitefield Main Road and the Outer Ring Road. Pickups here are common for both daily office commutes and weekend outstation departures, since Whitefield sits on the route toward Hoskote and further east.",
    detail:
      "Getting out of Whitefield usually means crossing ITPL Main Road or Varthur Road during IT-shift traffic, so we build extra buffer time into early-morning airport pickups scheduled from here. It's also one of the farthest points on the city's east side, making it a common starting point for outstation trips toward Hoskote, Chikkaballapur and onward into Andhra Pradesh.",
    nearbySlugs: ["marathahalli", "electronic-city"]
  },
  {
    slug: "electronic-city",
    name: "Electronic City",
    landmarks: ["Infosys campus", "Wipro campus", "Hosur Road", "Electronic City Phase 1 & 2"],
    intro:
      "Electronic City is Bangalore's other major IT hub, split across Phase 1 and Phase 2 along Hosur Road. Its position on NH44 makes it a practical pickup point for outstation trips heading toward Hosur, Krishnagiri and onward to Tamil Nadu, alongside routine corporate and local travel.",
    detail:
      "Electronic City connects to the rest of Bangalore mainly via Hosur Road (NH44) and the Electronic City Elevated Expressway, both of which see heavy weekday IT-shift traffic. That same NH44 corridor makes it a natural starting point for outstation drives toward Hosur, Krishnagiri and further into Tamil Nadu.",
    nearbySlugs: ["koramangala", "jp-nagar"]
  },
  {
    slug: "koramangala",
    name: "Koramangala",
    landmarks: ["Forum Mall", "Sony World Signal", "Koramangala 80 Feet Road"],
    intro:
      "Koramangala is one of Bangalore's most central residential and commercial neighbourhoods, known for its numbered Block layout, restaurants and startup offices. Its location close to both HSR Layout and the city centre makes it convenient for local hourly bookings as well as airport and outstation pickups.",
    detail:
      "Koramangala's numbered-Block layout and narrow internal roads mean local trips here are usually short, direct hops rather than long crosstown drives. Its central position also keeps airport and outstation departure timings fairly predictable compared to areas further from the Outer Ring Road.",
    nearbySlugs: ["indiranagar", "jayanagar"]
  },
  {
    slug: "indiranagar",
    name: "Indiranagar",
    landmarks: ["100 Feet Road", "CMH Road", "Indiranagar Metro Station"],
    intro:
      "Indiranagar's 100 Feet Road and CMH Road area is a well-known residential and commercial stretch close to HAL and the old airport road. It's a frequent pickup point for corporate travel and airport transfers given its proximity to the Bengaluru city centre and the airport road corridor.",
    detail:
      "Indiranagar's 100 Feet Road and CMH Road stretch is one of Bangalore's busiest evening and weekend corridors, so bookings from here often cluster around dinner-hour and late-night pickups alongside the usual airport and outstation departures.",
    nearbySlugs: ["koramangala", "hebbal"]
  },
  {
    slug: "jayanagar",
    name: "Jayanagar",
    landmarks: ["Jayanagar 4th Block Shopping Complex", "Jayanagar Shopping Complex", "South End Circle"],
    intro:
      "Jayanagar is one of Asia's largest planned residential localities, organised into numbered Blocks around the 4th Block shopping complex. It's a well-established South Bangalore neighbourhood, commonly booked for family outstation trips, local city travel and wedding-season transportation.",
    detail:
      "Jayanagar's older, numbered-Block street grid is well served by the Green Line metro, but its internal roads are narrower than newer parts of the city — a sedan or Innova is usually the practical choice for a local pickup here, with larger Tempo Travellers picking up from a nearby main road for group departures.",
    nearbySlugs: ["jp-nagar", "koramangala"]
  },
  {
    slug: "jp-nagar",
    name: "JP Nagar",
    landmarks: ["JP Nagar Metro Station", "Sarakki Lake", "Brigade Millennium"],
    intro:
      "JP Nagar is a large residential locality in South Bangalore adjoining Jayanagar and Banashankari, with several numbered phases spread along Bannerghatta Road. It's a regular pickup area for both local sightseeing trips and outstation departures toward Mysore, Bannerghatta and beyond.",
    detail:
      "JP Nagar sits directly along Bannerghatta Road, putting it on the straight route south toward Bannerghatta National Park and onward to Mysore — a common direction for both day trips and longer outstation departures booked from this side of the city.",
    nearbySlugs: ["jayanagar", "electronic-city"]
  },
  {
    slug: "marathahalli",
    name: "Marathahalli",
    landmarks: ["Marathahalli Bridge", "Outer Ring Road IT corridor", "Marathahalli Market"],
    intro:
      "Marathahalli sits on the Outer Ring Road connecting Whitefield to the rest of the IT corridor, and is one of Bangalore's busiest commercial and residential junctions. Its ORR location makes it a practical staging point for both corporate transport and outstation trips heading east or south.",
    detail:
      "The Marathahalli junction on the Outer Ring Road is one of the more congested stretches in the city during IT-shift hours, so pickups timed around 8–10 AM or 5–8 PM typically need extra buffer built into the schedule.",
    nearbySlugs: ["whitefield", "koramangala"]
  },
  {
    slug: "hebbal",
    name: "Hebbal",
    landmarks: ["Hebbal Flyover", "Hebbal Lake", "Bellary Road (NH44)"],
    intro:
      "Hebbal sits on Bellary Road (NH44), the main route toward Kempegowda International Airport, making it one of the most convenient pickup points in North Bangalore for airport transfers as well as outstation trips heading north toward Hyderabad or Tirupati.",
    detail:
      "Hebbal's position on Bellary Road (NH44) puts it roughly 25–30 minutes from Kempegowda International Airport in normal traffic, making it one of the more time-predictable pickup points in the city for early-morning flights.",
    nearbySlugs: ["yelahanka", "indiranagar"]
  },
  {
    slug: "yelahanka",
    name: "Yelahanka",
    landmarks: ["Kempegowda International Airport", "Yelahanka Air Force Station", "Yelahanka New Town"],
    intro:
      "Yelahanka is a satellite town in North Bangalore, closest of all the areas we serve to Kempegowda International Airport. It's a natural base for early-morning or late-night airport pickups and drops, alongside local travel within North Bangalore.",
    detail:
      "As the closest locality we serve to Kempegowda International Airport, Yelahanka pickups for early-morning or late-night flights typically need the least buffer time of any area on this list.",
    nearbySlugs: ["hebbal", "yeshwanthpur"]
  },
  {
    slug: "yeshwanthpur",
    name: "Yeshwanthpur",
    landmarks: ["Yeshwanthpur Railway Station", "Peenya Industrial Area", "Esteem Mall"],
    intro:
      "Yeshwanthpur is a major railway and industrial hub in North West Bangalore, close to Peenya's manufacturing belt. It's a common pickup point for travellers connecting from the railway station as well as corporate transport for the surrounding industrial area.",
    detail:
      "Yeshwanthpur's railway station means a meaningful share of pickups here are timed against train arrivals rather than flight schedules, and its position near the Peenya industrial belt also makes it a regular pickup point for corporate and logistics-related group travel.",
    nearbySlugs: ["hebbal", "yelahanka"]
  }
];

export function findLocation(slug: string): LocationPage | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
