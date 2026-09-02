import { getDestinationBySlugOrName } from "../data/destinationData.js";

console.log("=== VERIFYING KONDAVEEDU FORT EXPLICIT RESOLUTION ===");

const dest1 = getDestinationBySlugOrName("kondaveedu-fort");
console.log("Lookup 'kondaveedu-fort':", dest1?.name, "| Slug:", dest1?.slug);

const dest2 = getDestinationBySlugOrName("Kondaveedu Fort");
console.log("Lookup 'Kondaveedu Fort':", dest2?.name, "| Slug:", dest2?.slug);

if (dest1?.slug === "kondaveedu-fort" && dest2?.slug === "kondaveedu-fort" && dest1?.name === "Kondaveedu Fort") {
  console.log("✅ VERIFICATION PASSED: Kondaveedu Fort opens Kondaveedu Fort details ONLY!");
} else {
  console.error("❌ VERIFICATION FAILED! Kondaveedu Fort did not resolve correctly.");
  process.exit(1);
}
