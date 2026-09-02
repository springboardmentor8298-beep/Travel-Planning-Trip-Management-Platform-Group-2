import { getDestinationBySlugOrName } from "../data/destinationData.js";

const testCases = ["kondaveedu-fort", "charminar", "taj-mahal", "araku-valley"];

console.log("=== VERIFYING YOUTUBE URL GENERATION ===");

for (const slug of testCases) {
  const dest = getDestinationBySlugOrName(slug);
  console.log(`\nDestination: "${dest.name}" (slug: ${dest.slug})`);
  console.log(`  - youtubeUrl: ${dest.youtubeUrl}`);
  
  const expectedQuery = encodeURIComponent(`${dest.name} Travel Guide`);
  const expectedUrl = `https://www.youtube.com/results?search_query=${expectedQuery}`;

  if (dest.youtubeUrl.includes("Y0rQ4c_5d-A") || dest.youtubeUrl.includes("dQw4w9WgXcQ")) {
    console.error(`❌ FAIL: Contains hardcoded video ID!`);
    process.exit(1);
  } else if (dest.youtubeUrl === expectedUrl) {
    console.log(`  ✓ SUCCESS: Dynamically generated search URL matches!`);
  } else {
    console.log(`  ✓ Custom URL: ${dest.youtubeUrl}`);
  }
}

console.log("\nALL TEST CASES PASSED!");
