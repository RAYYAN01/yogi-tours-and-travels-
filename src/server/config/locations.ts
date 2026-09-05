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
  },
  {
    slug: "hsr-layout",
    name: "HSR Layout",
    landmarks: ["Agara Lake", "27th Main Road (Sector 1)", "Silk Board Junction"],
    intro:
      "HSR Layout is a well-established residential and commercial locality in Southeast Bangalore, organised into numbered Sectors and known for the restaurant and cafe stretch along 27th Main Road. It sits between Koramangala and Bellandur, close to the Outer Ring Road IT corridor — a regular pickup point for corporate travel, local trips and outstation departures.",
    detail:
      "HSR Layout sits right next to Silk Board Junction, one of Bangalore's busiest interchanges connecting Hosur Road, the Outer Ring Road and Electronic City — so trips heading that way, or onward to the airport via the ORR, generally need extra buffer time during peak hours. Pickups from within the Sector layout itself are usually straightforward.",
    nearbySlugs: ["koramangala", "electronic-city"]
  },
  {
    slug: "rajajinagar",
    name: "Rajajinagar",
    landmarks: ["Rajajinagar Metro Station", "Dr. Rajkumar Road", "Rajajinagar 1st Block Market"],
    intro:
      "Rajajinagar is one of Bangalore's older, well-established residential localities, laid out in numbered Blocks along Dr. Rajkumar Road in the city's west and served by the Green Line metro. It's a regular pickup point for local city travel as well as airport and outstation trips starting from West Bangalore.",
    detail:
      "Airport trips from Rajajinagar typically route north through Yeshwanthpur and Hebbal onto Bellary Road (NH44), the same corridor used from those areas — so timing is comparable once you're past the initial cross-town stretch. Local pickups within Rajajinagar's Block layout are generally quick and direct.",
    nearbySlugs: ["yeshwanthpur", "jayanagar"]
  },
  {
    slug: "malleshwaram",
    name: "Malleshwaram",
    landmarks: ["Sampige Road", "Malleshwaram Metro Station", "Mantri Square Mall"],
    intro:
      "Malleshwaram is one of Bangalore's oldest planned localities, centred on Sampige Road and its long-running market street, and served by the Green Line metro. It's a regular pickup point for family and local trips in Central Bangalore, alongside airport and outstation departures.",
    detail:
      "Malleshwaram's older street grid around Sampige Road and Margosa Road is narrow and market-heavy, so a sedan or Innova pickup from the main road is usually quicker than trying to reach deep into the internal lanes — larger Tempo Travellers typically pick up from a nearby arterial road instead.",
    nearbySlugs: ["rajajinagar", "yeshwanthpur"]
  },
  {
    slug: "vijayanagar",
    name: "Vijayanagar",
    landmarks: ["Vijayanagar Metro Station", "Attiguppe", "Vijayanagar Sports Complex"],
    intro:
      "Vijayanagar is an established residential locality in West Bangalore along the Purple Line metro corridor, between Rajajinagar and the Mysore Road stretch toward Kengeri. It's commonly booked for local travel and as a starting point for outstation trips heading toward Mysore.",
    detail:
      "Vijayanagar sits close to Mysore Road (NH275), the direct route out toward Kengeri, Ramanagara and on to Mysore — making it a practical pickup point for that direction, alongside routine local and airport trips that route through Rajajinagar toward the rest of the city.",
    nearbySlugs: ["rajajinagar", "basaveshwaranagar"]
  },
  {
    slug: "basaveshwaranagar",
    name: "Basaveshwaranagar",
    landmarks: ["Basaveshwara Circle", "Basaveshwaranagar 2nd Stage", "Modi Hospital Junction"],
    intro:
      "Basaveshwaranagar is a residential locality in West Bangalore sitting between Rajajinagar and Vijayanagar, popular for local family travel and as a pickup point for trips heading out along Magadi Road or Mysore Road.",
    detail:
      "Basaveshwaranagar connects easily to both Magadi Road and the Rajajinagar arterial network, so local pickups here are generally quick, while outstation trips typically join Mysore Road via Vijayanagar for the drive toward Ramanagara and Mysore.",
    nearbySlugs: ["vijayanagar", "rajajinagar"]
  },
  {
    slug: "nagarbhavi",
    name: "Nagarbhavi",
    landmarks: ["Bangalore University Campus", "Nagarbhavi Circle", "Outer Ring Road Junction"],
    intro:
      "Nagarbhavi is a residential locality in West Bangalore known for the Bangalore University campus and its junction with the Outer Ring Road. It's a regular pickup point for students, families and outstation departures toward Mysore via Mysore Road.",
    detail:
      "Nagarbhavi Circle connects directly onto the Outer Ring Road as well as Mysore Road, so it's a practical staging point for both crosstown trips and the drive out toward Kengeri, Ramanagara and Mysore.",
    nearbySlugs: ["kengeri", "vijayanagar"]
  },
  {
    slug: "kengeri",
    name: "Kengeri",
    landmarks: ["Kengeri Satellite Town", "Kengeri Bus Terminus", "Mysore Road (NH275)"],
    intro:
      "Kengeri is a satellite town on Bangalore's western edge, sitting directly on Mysore Road (NH275) — the main route toward Ramanagara, Channapatna and Mysore. It's one of the most convenient pickup points on this side of the city for outstation trips in that direction.",
    detail:
      "Being right on NH275, Kengeri pickups for Mysore-direction outstation trips typically avoid the heavier Central Bangalore traffic entirely, making departure timing more predictable than from areas further inside the city.",
    nearbySlugs: ["nagarbhavi", "rajarajeshwari-nagar"]
  },
  {
    slug: "rajarajeshwari-nagar",
    name: "Rajarajeshwari Nagar",
    landmarks: ["RR Nagar", "Global Village Tech Park", "Mysore Road (NH275)"],
    intro:
      "Rajarajeshwari Nagar (RR Nagar) is a residential locality in Southwest Bangalore along Mysore Road, close to Global Village Tech Park. It's regularly booked for corporate travel to and from the tech park as well as outstation trips toward Mysore.",
    detail:
      "RR Nagar's position on Mysore Road puts it on the direct outbound route toward Ramanagara and Mysore, similar to Kengeri — a practical advantage for outstation departure timing compared with areas further inside the city.",
    nearbySlugs: ["kengeri", "nagarbhavi"]
  },
  {
    slug: "peenya",
    name: "Peenya",
    landmarks: ["Peenya Industrial Area", "Peenya Metro Station", "Tumkur Road (NH4)"],
    intro:
      "Peenya is home to one of Asia's largest industrial areas, sitting on Tumkur Road (NH4) in Northwest Bangalore and served by the Green Line metro. It's a regular pickup point for corporate and logistics-related group travel connected to the industrial belt.",
    detail:
      "Peenya's position on Tumkur Road (NH4) makes it a practical starting point for trips heading northwest out of the city, while its metro connectivity and proximity to Yeshwanthpur keep local and airport transfers relatively straightforward.",
    nearbySlugs: ["yeshwanthpur", "jayanagar"]
  },
  {
    slug: "banashankari",
    name: "Banashankari",
    landmarks: ["Banashankari Temple", "Banashankari Bus Terminus", "Kanakapura Road"],
    intro:
      "Banashankari is a well-established South Bangalore locality named for the Banashankari Temple, and home to one of the city's major bus terminuses at the start of Kanakapura Road. It's a common pickup point for family trips, local travel and outstation departures south of the city.",
    detail:
      "Kanakapura Road out of Banashankari is the direct route toward Kanakapura and onward to parts of the Mysore–Bannerghatta corridor, making this a practical starting point for outstation trips in that direction alongside routine local bookings.",
    nearbySlugs: ["basavanagudi", "jp-nagar"]
  },
  {
    slug: "basavanagudi",
    name: "Basavanagudi",
    landmarks: ["Bull Temple (Dodda Basavana Gudi)", "Bugle Rock Park", "Gandhi Bazaar"],
    intro:
      "Basavanagudi is one of Bangalore's oldest neighbourhoods, built around the historic Bull Temple and the Gandhi Bazaar market street. It's a regular pickup point for family outstation trips and local city travel in South Bangalore.",
    detail:
      "Basavanagudi's older street layout around Gandhi Bazaar is narrow and market-heavy like Malleshwaram, so pickups are usually arranged from a nearby main road rather than deep inside the market lanes, especially for larger vehicles.",
    nearbySlugs: ["banashankari", "jayanagar"]
  },
  {
    slug: "btm-layout",
    name: "BTM Layout",
    landmarks: ["Madiwala Lake", "Silk Board Junction", "BTM Layout 2nd Stage"],
    intro:
      "BTM Layout is a busy residential and commercial locality in South Bangalore between Koramangala and JP Nagar, close to Madiwala Lake and Silk Board Junction. It's a frequent pickup point for corporate travel, local trips and airport transfers.",
    detail:
      "BTM Layout's proximity to Silk Board Junction means the same peak-hour congestion that affects HSR Layout and Koramangala applies here too — trips toward Electronic City or the airport via the ORR are best timed outside the morning and evening IT-shift windows.",
    nearbySlugs: ["koramangala", "jp-nagar"]
  },
  {
    slug: "bannerghatta-road",
    name: "Bannerghatta Road",
    landmarks: ["Bannerghatta National Park", "IIM Bangalore", "Meenakshi Mall"],
    intro:
      "Bannerghatta Road runs south from JP Nagar toward Bannerghatta National Park, and is home to IIM Bangalore and a dense stretch of residential layouts. It's a regular pickup corridor for both local day trips to Bannerghatta and longer outstation journeys further south.",
    detail:
      "As the direct route toward Bannerghatta National Park and onward toward the Mysore road network, this corridor is a practical starting point for day trips as well as multi-day outstation journeys heading south of the city.",
    nearbySlugs: ["jp-nagar", "electronic-city"]
  },
  {
    slug: "domlur",
    name: "Domlur",
    landmarks: ["Domlur Flyover", "Old Airport Road", "HAL Junction"],
    intro:
      "Domlur is a compact residential and commercial locality between Indiranagar and the old HAL Airport Road, well known for its flyover junction. It's a convenient pickup point for corporate travel and airport transfers given its central position.",
    detail:
      "Domlur's flyover junction connects directly onto Old Airport Road and toward Indiranagar's 100 Feet Road, making it one of the more centrally positioned pickup points for both corporate travel and airport-direction trips.",
    nearbySlugs: ["indiranagar", "koramangala"]
  },
  {
    slug: "old-airport-road",
    name: "HAL / Old Airport Road",
    landmarks: ["HAL Airport", "HAL Heritage Centre & Aerospace Museum", "Old Airport Road"],
    intro:
      "The HAL and Old Airport Road area in East Bangalore is home to the historic HAL Airport and its aerospace museum, sitting between Indiranagar and Marathahalli. It's a regular pickup point for corporate travel given the concentration of offices along this stretch.",
    detail:
      "Old Airport Road connects directly toward Indiranagar on one side and the Outer Ring Road on the other, making it a practical middle point for trips heading either into central Bangalore or out toward the eastern IT corridor.",
    nearbySlugs: ["indiranagar", "marathahalli"]
  },
  {
    slug: "bellandur",
    name: "Bellandur",
    landmarks: ["Bellandur Lake", "Sarjapur Road Junction", "Outer Ring Road IT Corridor"],
    intro:
      "Bellandur sits on the Outer Ring Road at its junction with Sarjapur Road, one of Bangalore's densest IT office clusters. It's a regular pickup point for corporate travel as well as outstation trips heading toward Sarjapur and beyond.",
    detail:
      "The ORR–Sarjapur Road junction at Bellandur is one of the busier stretches in East Bangalore during office hours, so corporate pickups timed around the morning and evening IT shifts typically need extra buffer built in.",
    nearbySlugs: ["sarjapur-road", "koramangala"]
  },
  {
    slug: "sarjapur-road",
    name: "Sarjapur Road",
    landmarks: ["Wipro Corporate Office", "RGA Tech Park", "Sarjapur Road IT Corridor"],
    intro:
      "Sarjapur Road is a major IT corridor in Southeast Bangalore running from the Outer Ring Road out toward Sarjapur town, home to large campuses including Wipro's corporate office. It's a common pickup point for corporate travel and group transportation.",
    detail:
      "Sarjapur Road's long stretch means pickup timing depends heavily on which end you're near — the ORR junction end shares Bellandur's peak-hour congestion, while the outer stretch toward Sarjapur town is comparatively freer-flowing.",
    nearbySlugs: ["bellandur", "koramangala"]
  },
  {
    slug: "kr-puram",
    name: "KR Puram",
    landmarks: ["KR Puram Railway Station", "KR Puram Bridge", "Tin Factory Junction"],
    intro:
      "KR Puram is a railway and road junction town in East Bangalore, connecting the old airport road, Whitefield and the route toward Hoskote. It's a common pickup point for travellers connecting from the railway station as well as local and outstation trips east of the city.",
    detail:
      "The KR Puram Bridge and Tin Factory junction are well-known bottleneck points during peak hours, so trips routed through here toward Whitefield or Hoskote generally benefit from timing outside the morning and evening rush.",
    nearbySlugs: ["whitefield", "old-airport-road"]
  },
  {
    slug: "jakkur",
    name: "Jakkur",
    landmarks: ["Jakkur Aerodrome", "Jakkur Lake", "Bellary Road Corridor"],
    intro:
      "Jakkur is a locality in North Bangalore known for Jakkur Aerodrome and its lake, sitting close to the Bellary Road corridor toward Kempegowda International Airport. It's a convenient pickup point for both airport transfers and local North Bangalore travel.",
    detail:
      "Jakkur's proximity to Hebbal and the Bellary Road (NH44) corridor keeps airport-direction timing comparable to Hebbal and Yelahanka, while local trips within North Bangalore are generally quick given the area's less congested layout.",
    nearbySlugs: ["hebbal", "yelahanka"]
  },
  {
    slug: "nagawara",
    name: "Nagawara",
    landmarks: ["Manyata Tech Park", "Nagawara Lake", "Nagawara Junction"],
    intro:
      "Nagawara is home to Manyata Tech Park, one of Bangalore's largest IT campuses, sitting just off the Outer Ring Road near Hebbal. It's a regular pickup point for corporate travel to and from the tech park as well as airport transfers.",
    detail:
      "Nagawara's position between Hebbal and the ORR means corporate pickups here often need the same peak-hour buffer as Hebbal, while its proximity to Bellary Road (NH44) keeps airport-direction trips relatively quick outside those windows.",
    nearbySlugs: ["hebbal", "hennur"]
  },
  {
    slug: "thanisandra",
    name: "Thanisandra",
    landmarks: ["Thanisandra Main Road", "Manyata Tech Park Vicinity", "Nagawara Junction"],
    intro:
      "Thanisandra is a fast-growing residential locality in North Bangalore adjoining Nagawara and Manyata Tech Park, popular for corporate travel and family outstation trips.",
    detail:
      "Thanisandra Main Road feeds directly into the Nagawara/Hebbal junction network, keeping both corporate pickups near Manyata Tech Park and airport-direction trips via Bellary Road reasonably predictable outside peak hours.",
    nearbySlugs: ["nagawara", "hebbal"]
  },
  {
    slug: "hennur",
    name: "Hennur",
    landmarks: ["Hennur Main Road", "Hennur Bande", "Kalyan Nagar Junction"],
    intro:
      "Hennur is a residential locality in Northeast Bangalore along Hennur Main Road, close to Kalyan Nagar and Nagawara. It's a regular pickup point for local travel and corporate trips toward the Nagawara/Hebbal IT corridor.",
    detail:
      "Hennur Main Road connects toward both Nagawara and Kalyan Nagar, giving reasonably direct access to the Bellary Road (NH44) corridor for airport transfers as well as the ORR for corporate travel.",
    nearbySlugs: ["kalyan-nagar", "nagawara"]
  },
  {
    slug: "kalyan-nagar",
    name: "Kalyan Nagar",
    landmarks: ["HRBR Layout", "Kalyan Nagar Main Road", "Banaswadi Junction"],
    intro:
      "Kalyan Nagar is a residential locality in Northeast Bangalore adjoining HRBR Layout and Banaswadi, commonly booked for family and local travel as well as corporate trips toward the Hebbal/Nagawara IT corridor.",
    detail:
      "Kalyan Nagar connects toward Banaswadi and onward to the Outer Ring Road, giving practical access to both the eastern IT corridor and, via Hebbal, the Bellary Road route to the airport.",
    nearbySlugs: ["hennur", "indiranagar"]
  },
  {
    slug: "rt-nagar",
    name: "RT Nagar",
    landmarks: ["RT Nagar Main Road", "Sanjaynagar Junction", "Hebbal Vicinity"],
    intro:
      "RT Nagar is a residential locality in North Bangalore between Hebbal and the city centre, regularly booked for local family travel and as a starting point for airport trips via the nearby Bellary Road corridor.",
    detail:
      "RT Nagar's position just south of Hebbal means airport-direction trips join Bellary Road (NH44) quickly, keeping timing comparable to Hebbal itself for most of the journey.",
    nearbySlugs: ["hebbal", "malleshwaram"]
  }
];

export function findLocation(slug: string): LocationPage | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
