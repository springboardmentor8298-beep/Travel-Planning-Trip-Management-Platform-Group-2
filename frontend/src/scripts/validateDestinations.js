import { DESTINATIONS_REGISTRY, STATES_LIST } from "../data/destinationData.js";

console.log("=================================================");
console.log("TRIPNEST TOURIST DESTINATIONS DATASET VALIDATION");
console.log("=================================================");

const allDestinations = Object.values(DESTINATIONS_REGISTRY).filter(Boolean);
console.log(`Total Master Destinations Loaded: ${allDestinations.length}`);
console.log("-------------------------------------------------");

let missingStatesCount = 0;
const report = {};

STATES_LIST.forEach((stateName) => {
  if (stateName === "All States & Global") return;

  const matches = allDestinations.filter((dest) => {
    if (!dest) return false;
    if (stateName === "International") {
      return (dest.country || "").trim().toLowerCase() !== "india";
    }
    return (dest.state || "").trim().toLowerCase() === stateName.trim().toLowerCase();
  });

  report[stateName] = matches.length;

  if (matches.length === 0) {
    missingStatesCount++;
    console.error(`❌ MISSING STATE: "${stateName}" has 0 tourist destinations!`);
  } else {
    console.log(`✓ ${stateName.padEnd(42, ' ')} : ${matches.length} destinations`);
  }
});

console.log("-------------------------------------------------");
if (missingStatesCount === 0) {
  console.log("SUCCESS: Every single state & region has matching tourist attractions!");
  console.log("Zero missing states detected.");
} else {
  console.error(`FAILURE: Found ${missingStatesCount} unpopulated states/regions!`);
  process.exit(1);
}
console.log("=================================================");
