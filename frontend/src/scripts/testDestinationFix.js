import { getDestinationBySlugOrName } from "../data/destinationData.js";

const testQueries = [
  "Red Fort",
  "red-fort-lal-qila",
  "Qutub Minar",
  "qutub-minar-complex",
  "Tirumala Temple",
  "tirumala-venkateswara-temple",
  "Kondaveedu Fort",
  "kondaveedu-fort",
  "Araku Valley",
  "araku-valley-coffee-estates"
];

console.log("=== TESTING DESTINATION RESOLUTION FOR SPECIFIED TEST CASES ===");
let passed = 0;

testQueries.forEach((query) => {
  const dest = getDestinationBySlugOrName(query);
  if (dest && dest.name && dest.heroImage && dest.description && dest.history) {
    console.log(`[PASS] Query "${query}" resolved to: "${dest.name}" (Slug: ${dest.slug})`);
    passed++;
  } else {
    console.error(`[FAIL] Query "${query}" failed to resolve valid destination!`);
  }
});

console.log(`\nResult: ${passed}/${testQueries.length} test queries resolved successfully.`);
if (passed === testQueries.length) {
  console.log("SUCCESS: All test destination detail pages resolve cleanly with full required fields!");
} else {
  process.exit(1);
}
