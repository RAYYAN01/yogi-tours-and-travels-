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
  nearbySlugs: string[];
}

export const LOCATIONS: LocationPage[] = [
  {
    slug: "whitefield",
    name: "Whitefield",
    landmarks: ["ITPL", "Phoenix Marketcity", "Prestige Shantiniketan", "Whitefield Railway Station"],
    intro:
      "Whitefield is Bangalore's largest IT corridor, home to ITPL and a dense cluster of tech campuses, residential layouts and malls along Whitefield Main Road and the Outer Ring Road. Pickups here are common for both daily office commutes and weekend outstation departures, since Whitefield sits on the route toward Hoskote and further east.",
    nearbySlugs: ["marathahalli", "electronic-city"]
  },
  {
    slug: "electronic-city",
    name: "Electronic City",
    landmarks: ["Infosys campus", "Wipro campus", "Hosur Road", "Electronic City Phase 1 & 2"],
    intro:
      "Electronic City is Bangalore's other major IT hub, split across Phase 1 and Phase 2 along Hosur Road. Its position on NH44 makes it a practical pickup point for outstation trips heading toward Hosur, Krishnagiri and onward to Tamil Nadu, alongside routine corporate and local travel.",
    nearbySlugs: ["koramangala", "jp-nagar"]
  },
  {
    slug: "koramangala",
    name: "Koramangala",
    landmarks: ["Forum Mall", "Sony World Signal", "Koramangala 80 Feet Road"],
    intro:
      "Koramangala is one of Bangalore's most central residential and commercial neighbourhoods, known for its numbered Block layout, restaurants and startup offices. Its location close to both HSR Layout and the city centre makes it convenient for local hourly bookings as well as airport and outstation pickups.",
    nearbySlugs: ["indiranagar", "jayanagar"]
  },
  {
    slug: "indiranagar",
    name: "Indiranagar",
    landmarks: ["100 Feet Road", "CMH Road", "Indiranagar Metro Station"],
    intro:
      "Indiranagar's 100 Feet Road and CMH Road area is a well-known residential and commercial stretch close to HAL and the old airport road. It's a frequent pickup point for corporate travel and airport transfers given its proximity to the Bengaluru city centre and the airport road corridor.",
    nearbySlugs: ["koramangala", "hebbal"]
  },
  {
    slug: "jayanagar",
    name: "Jayanagar",
    landmarks: ["Jayanagar 4th Block Shopping Complex", "Jayanagar Shopping Complex", "South End Circle"],
    intro:
      "Jayanagar is one of Asia's largest planned residential localities, organised into numbered Blocks around the 4th Block shopping complex. It's a well-established South Bangalore neighbourhood, commonly booked for family outstation trips, local city travel and wedding-season transportation.",
    nearbySlugs: ["jp-nagar", "koramangala"]
  },
  {
    slug: "jp-nagar",
    name: "JP Nagar",
    landmarks: ["JP Nagar Metro Station", "Sarakki Lake", "Brigade Millennium"],
    intro:
      "JP Nagar is a large residential locality in South Bangalore adjoining Jayanagar and Banashankari, with several numbered phases spread along Bannerghatta Road. It's a regular pickup area for both local sightseeing trips and outstation departures toward Mysore, Bannerghatta and beyond.",
    nearbySlugs: ["jayanagar", "electronic-city"]
  },
  {
    slug: "marathahalli",
    name: "Marathahalli",
    landmarks: ["Marathahalli Bridge", "Outer Ring Road IT corridor", "Marathahalli Market"],
    intro:
      "Marathahalli sits on the Outer Ring Road connecting Whitefield to the rest of the IT corridor, and is one of Bangalore's busiest commercial and residential junctions. Its ORR location makes it a practical staging point for both corporate transport and outstation trips heading east or south.",
    nearbySlugs: ["whitefield", "koramangala"]
  },
  {
    slug: "hebbal",
    name: "Hebbal",
    landmarks: ["Hebbal Flyover", "Hebbal Lake", "Bellary Road (NH44)"],
    intro:
      "Hebbal sits on Bellary Road (NH44), the main route toward Kempegowda International Airport, making it one of the most convenient pickup points in North Bangalore for airport transfers as well as outstation trips heading north toward Hyderabad or Tirupati.",
    nearbySlugs: ["yelahanka", "indiranagar"]
  },
  {
    slug: "yelahanka",
    name: "Yelahanka",
    landmarks: ["Kempegowda International Airport", "Yelahanka Air Force Station", "Yelahanka New Town"],
    intro:
      "Yelahanka is a satellite town in North Bangalore, closest of all the areas we serve to Kempegowda International Airport. It's a natural base for early-morning or late-night airport pickups and drops, alongside local travel within North Bangalore.",
    nearbySlugs: ["hebbal", "yeshwanthpur"]
  },
  {
    slug: "yeshwanthpur",
    name: "Yeshwanthpur",
    landmarks: ["Yeshwanthpur Railway Station", "Peenya Industrial Area", "Esteem Mall"],
    intro:
      "Yeshwanthpur is a major railway and industrial hub in North West Bangalore, close to Peenya's manufacturing belt. It's a common pickup point for travellers connecting from the railway station as well as corporate transport for the surrounding industrial area.",
    nearbySlugs: ["hebbal", "yelahanka"]
  }
];

export function findLocation(slug: string): LocationPage | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
