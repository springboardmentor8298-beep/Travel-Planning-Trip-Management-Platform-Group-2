import { DESTINATIONS_REGISTRY, getDestinationBySlugOrName } from "../data/destinationData.js";

const TEST_SLUGS = [
  "kondaveedu-fort",
  "tirumala-venkateswara-temple",
  "araku-valley-coffee-estates",
  "taj-mahal",
  "borra-caves",
  "gandikota-fort"
];

console.log("=== DESTINATION DETAILS REDESIGN VERIFICATION ===");

let passed = true;

TEST_SLUGS.forEach(slug => {
  const dest = getDestinationBySlugOrName(slug);
  if (!dest) {
    console.error(`❌ FAULT: Could not find destination for ${slug}`);
    passed = false;
    return;
  }

  console.log(`\n✅ Destination Loaded: ${dest.name} (${dest.city}, ${dest.state})`);
  
  // Verify FAQ removed
  if (dest.FAQ !== undefined && dest.FAQ.length > 0) {
    console.warn(`⚠️ Warning: FAQ array present on ${dest.name}`);
  }

  // Verify key fields
  const requiredFields = [
    "fullIntroduction", "completeHistory", "builtBy", "builtYear", "dynasty",
    "whyFamous", "historicalSignificance", "culturalSignificance", "religiousImportance",
    "unescoStatus", "architectureStyle", "constructionMaterials", "elevationArea",
    "bestTimeToVisit", "timings", "entryFee", "recommendedDuration", "howToReach",
    "nearestRailway", "nearestAirport", "nearbyPlaces", "thingsToDo", "famousFoods",
    "shopping", "festivals", "travelTips", "photographyTips", "safetyTips",
    "interestingFacts", "officialWebsite"
  ];

  let missingCount = 0;
  requiredFields.forEach(f => {
    if (!dest[f]) {
      console.error(`   ❌ Missing field: ${f}`);
      missingCount++;
      passed = false;
    }
  });

  if (missingCount === 0) {
    console.log(`   ✨ All 30 required schema fields are 100% present and filled!`);
  }
});

console.log("\n================================================");
if (passed) {
  console.log("SUCCESS: All verification checks passed!");
} else {
  console.log("FAILURE: Some checks failed.");
}
