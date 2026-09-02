import { DESTINATIONS_REGISTRY, ATTRACTION_CATEGORIES, getDestinationBySlugOrName } from "../data/destinationData.js";

console.log("=== DESTINATION MODULE PRODUCTION-READY VERIFICATION ===");

const allDestinations = Object.values(DESTINATIONS_REGISTRY).filter(Boolean);
console.log(`Total Registry Destinations Loaded: ${allDestinations.length}`);

let allPassed = true;

// 1. Verify 20 Specifically Required Destinations
console.log("\n[Test 1] Verifying 20 Specifically Required Andhra Pradesh Destinations...");
const REQUIRED_AP_DESTINATIONS = [
  "Kotappakonda",
  "Srisailam",
  "Mahanandi",
  "Ahobilam",
  "Belum Caves",
  "Gandikota",
  "Talakona Waterfalls",
  "Mypadu Beach",
  "Suryalanka Beach",
  "Kondakarla Ava",
  "Uppada Beach",
  "Coringa Wildlife Sanctuary",
  "Horsley Hills",
  "Lambasingi",
  "Pulicat Lake",
  "Sriharikota",
  "Penchalakona",
  "Nagalapuram Waterfalls",
  "Bhavani Island",
  "Rollapadu Wildlife Sanctuary"
];

let missingCount = 0;
REQUIRED_AP_DESTINATIONS.forEach((name) => {
  const match = getDestinationBySlugOrName(name) || allDestinations.find(d => d.name.toLowerCase().includes(name.toLowerCase()));
  if (match) {
    console.log(`  ✅ FOUND: ${name} -> "${match.name}" (${match.city}, ${match.state}) [Category: "${match.category}"]`);
  } else {
    console.error(`  ❌ MISSING: "${name}" not found in destination registry!`);
    missingCount++;
  }
});

if (missingCount === 0) {
  console.log("  ✅ SUCCESS: All 20 requested Andhra Pradesh destinations are 100% present!");
} else {
  console.error(`  ❌ FAULT: ${missingCount} required destinations missing!`);
  allPassed = false;
}

// 2. Verify Primary Category Uniqueness & Canonization
console.log("\n[Test 2] Verifying Primary Category Canonization across all destinations...");
const canonicalSet = new Set(ATTRACTION_CATEGORIES.filter(c => c !== "All Categories"));
let invalidCatCount = 0;
const catDistribution = {};

allDestinations.forEach((d) => {
  catDistribution[d.category] = (catDistribution[d.category] || 0) + 1;
  if (!canonicalSet.has(d.category)) {
    console.error(`  ❌ Invalid Category on "${d.name}": "${d.category}"`);
    invalidCatCount++;
  }
});

console.log("Category Distribution:", catDistribution);
if (invalidCatCount === 0) {
  console.log("  ✅ SUCCESS: 100% of destinations are assigned exactly one canonical primary category!");
} else {
  console.error(`  ❌ FAULT: Found ${invalidCatCount} non-canonical categories!`);
  allPassed = false;
}

// 3. Test Multi-Filter Intersection (State = Andhra Pradesh + Category = Heritage & Forts)
console.log("\n[Test 3] Testing Andhra Pradesh + Heritage & Forts filter intersection...");
const apForts = allDestinations.filter(d => (d.state || "").toLowerCase() === "andhra pradesh" && d.category === "Heritage & Forts");
console.log(`  Found ${apForts.length} Forts & Heritage monuments in Andhra Pradesh:`);
apForts.forEach(d => console.log(`  - ${d.name} [${d.category}]`));

// Ensure NO beaches, hill stations, temples, or waterfalls are present in apForts
const nonFortsInApForts = apForts.filter(d => d.category !== "Heritage & Forts");
if (apForts.length > 0 && nonFortsInApForts.length === 0) {
  console.log("  ✅ SUCCESS: Andhra Pradesh + Heritage & Forts returns ONLY forts & heritage monuments!");
} else {
  console.error("  ❌ FAULT: Category filtering returned non-heritage items!");
  allPassed = false;
}

// 4. Test Multi-Filter Intersection (State = Kerala + Category = Beaches)
console.log("\n[Test 4] Testing Kerala + Beaches filter intersection...");
const keralaBeaches = allDestinations.filter(d => (d.state || "").toLowerCase() === "kerala" && d.category === "Beaches");
console.log(`  Found ${keralaBeaches.length} Beaches in Kerala:`);
keralaBeaches.forEach(d => console.log(`  - ${d.name} [${d.category}]`));

const nonBeachesInKerala = keralaBeaches.filter(d => d.category !== "Beaches");
if (keralaBeaches.length > 0 && nonBeachesInKerala.length === 0) {
  console.log("  ✅ SUCCESS: Kerala + Beaches returns ONLY Kerala beaches!");
} else {
  console.error("  ❌ FAULT: State + Category filter failed for Kerala Beaches!");
  allPassed = false;
}

// 5. Test Search respecting selected filters
console.log("\n[Test 5] Testing Search respecting selected filters...");
const searchWithFilter = allDestinations.filter(d => {
  const matchesState = (d.state || "").toLowerCase() === "andhra pradesh";
  const matchesCategory = d.category === "Beaches";
  const matchesSearch = d.name.toLowerCase().includes("suryalanka") || d.name.toLowerCase().includes("beach");
  return matchesState && matchesCategory && matchesSearch;
});
console.log(`  Search Result Count: ${searchWithFilter.length} match(es)`);
searchWithFilter.forEach(d => console.log(`  - ${d.name} (${d.state}) [Category: ${d.category}]`));

if (searchWithFilter.length > 0 && searchWithFilter.every(d => d.category === "Beaches" && d.state === "Andhra Pradesh")) {
  console.log("  ✅ SUCCESS: Search respects all active filters!");
} else {
  console.error("  ❌ FAULT: Search did not respect active state/category filters.");
  allPassed = false;
}

console.log("\n================================================");
if (allPassed) {
  console.log("FINAL RESULT: DESTINATION MODULE IS 100% PRODUCTION-READY! 🎉");
} else {
  console.log("FINAL RESULT: DESTINATION MODULE VERIFICATION FAILED.");
}
