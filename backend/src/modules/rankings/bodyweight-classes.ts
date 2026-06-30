export type BodyweightClass = {
  id: string;
  label: string;
  minKg: number;
  maxKg: number | null;
};

export const bodyweightClasses: readonly BodyweightClass[] = [
  { id: "under_60", label: "Under 60 kg", minKg: 0, maxKg: 59.99 },
  { id: "60_74", label: "60-74 kg", minKg: 60, maxKg: 74.99 },
  { id: "75_89", label: "75-89 kg", minKg: 75, maxKg: 89.99 },
  { id: "90_104", label: "90-104 kg", minKg: 90, maxKg: 104.99 },
  { id: "105_plus", label: "105 kg+", minKg: 105, maxKg: null }
] as const;

export function findBodyweightClass(bodyweightKg: number | null): BodyweightClass | null {
  if (bodyweightKg === null) {
    return null;
  }

  return (
    bodyweightClasses.find((bodyweightClass) => {
      const belowMax = bodyweightClass.maxKg === null || bodyweightKg <= bodyweightClass.maxKg;
      return bodyweightKg >= bodyweightClass.minKg && belowMax;
    }) ?? null
  );
}
