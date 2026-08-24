// Confirmed daily-duty tariff terms — supplements vehicles.ratePerKm (the
// per-km rate itself stays on the vehicle record, the single source of
// truth for that number) with the extra terms the business quotes
// alongside it. Never invent a rate or a tariff for a vehicle not listed
// here; the views fall back to a plain "Price on Request" / ratePerKm-only
// display when no entry exists.

export interface DutyTariff {
  minKmPerDay: number;
  driverBata: number;
  /** Only set for vehicles with a confirmed separate non-AC rate — vehicles.ratePerKm is the AC rate. */
  nonAcRatePerKm?: number;
}

export const DUTY_POLICY = {
  dutyStart: "6:00 AM",
  dutyEnd: "10:00 PM",
  extraBataNote: "Extra driver Bata applies for duty after 10:00 PM",
  additionalChargesNote: "Toll, parking, permit and state taxes are additional"
} as const;

/** Keyed by vehicle slug. */
const TARIFFS: Record<string, DutyTariff> = {
  "maruti-swift-dzire": { minKmPerDay: 300, driverBata: 400 },
  "toyota-etios": { minKmPerDay: 300, driverBata: 400 },
  "toyota-innova": { minKmPerDay: 300, driverBata: 400 },
  "innova-crysta": { minKmPerDay: 300, driverBata: 400 },
  "tempo-traveller-12-seater": { minKmPerDay: 300, driverBata: 500 },
  "maharaja-tempo-traveller": { minKmPerDay: 300, driverBata: 700, nonAcRatePerKm: 20 },
  "tempo-traveller-17-seater": { minKmPerDay: 300, driverBata: 700, nonAcRatePerKm: 28 },
  "force-urbania": { minKmPerDay: 300, driverBata: 700 }
};

export function dutyTariff(slug: string): DutyTariff | null {
  return TARIFFS[slug] ?? null;
}

export function estimatedMinimumDailyTotal(ratePerKm: number, tariff: DutyTariff): number {
  return ratePerKm * tariff.minKmPerDay + tariff.driverBata;
}
