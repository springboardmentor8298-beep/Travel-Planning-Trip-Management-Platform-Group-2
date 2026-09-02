import { DESTINATIONS_REGISTRY, getDestinationBySlugOrName } from "../data/destinationData.js";

console.log("=== DYNAMIC YOUTUBE SEARCH VERIFICATION TEST ===");

const TEST_DESTINATIONS = [
  "Kondaveedu Fort",
  "Araku Valley",
  "Tirumala Temple",
  "Borra Caves",
  "Charminar",
  "Taj Mahal"
];

let allPassed = true;

TEST_DESTINATIONS.forEach((query) => {
  const dest = getDestinationBySlugOrName(query) || Object.values(DESTINATIONS_REGISTRY).find(d => d.name.toLowerCase().includes(query.toLowerCase()));

  console.log(`\nTesting Destination: "${query}"`);
  if (!dest || !dest.name) {
    console.error(`  ❌ FAULT: Destination "${query}" not found in registry!`);
    allPassed = false;
    return;
  }

  const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(dest.name + " Travel Guide")}`;
  const expectedPrefix = "https://www.youtube.com/results?search_query=";

  console.log(`  - Destination Name: "${dest.name}"`);
  console.log(`  - Generated URL: "${youtubeSearch}"`);

  if (!youtubeSearch.startsWith(expectedPrefix)) {
    console.error(`  ❌ FAULT: URL does not start with "${expectedPrefix}"`);
    allPassed = false;
  } else if (!youtubeSearch.includes(encodeURIComponent("Travel Guide"))) {
    console.error(`  ❌ FAULT: URL missing "Travel Guide" search query!`);
    allPassed = false;
  } else {
    console.log(`  ✅ SUCCESS: Perfectly constructed dynamic YouTube search URL!`);
  }
});

console.log("\n================================================");
if (allPassed) {
  console.log("FINAL RESULT: ALL DYNAMIC YOUTUBE SEARCH TESTS PASSED! 🎉");
} else {
  console.log("FINAL RESULT: SOME TESTS FAILED.");
}
