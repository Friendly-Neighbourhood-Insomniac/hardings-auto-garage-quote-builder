export const SERVICES = [
  "Full vehicle diagnostics & mechanical repairs",
  "ECU / engine management upgrades & remapping",
  "Suspension, exhaust & drivetrain work",
  "Vehicle inspections & maintenance scheduling",
  "Lexus V8 engine conversions",
  "Performance tuning & custom builds",
  "Routine servicing (oil, filters, brakes)",
  "Panel beating",
  "Spray painting",
] as const;

export type Service = typeof SERVICES[number];
