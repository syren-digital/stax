export const RANGE_OPTIONS = [
  { value: "5y", label: "5 years" },
  { value: "3y", label: "3 years" },
  { value: "2y", label: "2 years" },
  { value: "1y", label: "1 year" },
  { value: "6m", label: "6 months" },
  { value: "3m", label: "3 months" },
  { value: "1m", label: "1 month" },
] as const;

export type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];
