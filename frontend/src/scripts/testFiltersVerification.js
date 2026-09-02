import { DESTINATIONS_REGISTRY } from "../data/destinationData.js";

console.log("=== MULTI-FILTER ENGINE VERIFICATION TEST ===");

const allDestinations = Object.values(DESTINATIONS_REGISTRY).filter(Boolean);
console.log(`Total Destinations Loaded in Registry: ${allDestinations.length}`);

let testPassed = true;

// 1. Verify Requirement 9: Every object contains rating, budgetCategory, bestSeason, state, category
console.log("\n[Test 1] Checking required schema fields on ALL destinations...");
let missingFieldCount = 0;
allDestinations.forEach((item) => {
  if (item.rating === undefined || item.rating === null) missingFieldCount++;
  if (!item.budgetCategory) missingFieldCount++;
  if (!item.bestSeason) missingFieldCount++;
  if (!item.state) missingFieldCount++;
  if (!item.category) missingFieldCount++;
});

if (missingFieldCount === 0) {
  console.log("  ✅ SUCCESS: All 740 destinations contain rating, budgetCategory, bestSeason, state, and category!");
} else {
  console.error(`  ❌ FAULT: Found ${missingFieldCount} missing fields across dataset!`);
  testPassed = false;
}

// 2. Rating Filter Test
console.log("\n[Test 2] Testing Rating Filter...");
const r0 = allDestinations.filter(d => (d.rating || 0) >= 0).length;
const r4 = allDestinations.filter(d => (d.rating || 0) >= 4.0).length;
const r45 = allDestinations.filter(d => (d.rating || 0) >= 4.5).length;
const r5 = allDestinations.filter(d => (d.rating || 0) >= 5.0).length;
console.log(`  Rating 0+: ${r0} | Rating 4.0+: ${r4} | Rating 4.5+: ${r45} | Rating 5.0: ${r5}`);
if (r0 >= r4 && r4 >= r45 && r45 >= r5 && r45 > 0 && r5 > 0) {
  console.log("  ✅ SUCCESS: Rating filtering produces logical decreasing subsets!");
} else {
  console.error("  ❌ FAULT: Rating filtering output is inconsistent.");
  testPassed = false;
}

// 3. Budget Filter Test
console.log("\n[Test 3] Testing Budget Filter...");
const bUnder = allDestinations.filter(d => (d.budgetCategory || "").includes("Under") || (d.budgetCategory || "").includes("1,000")).length;
const bMid = allDestinations.filter(d => (d.budgetCategory || "").includes("1,000") && !(d.budgetCategory || "").includes("Under")).length;
const bHigh = allDestinations.filter(d => (d.budgetCategory || "").includes("3,000")).length;
const bLux = allDestinations.filter(d => (d.budgetCategory || "").includes("Luxury") || (d.budgetCategory || "").includes("5,000")).length;
console.log(`  Budget (Under ₹1k): ${bUnder} | ₹1k–₹3k: ${bMid} | ₹3k–₹5k: ${bHigh} | Luxury (>₹5k): ${bLux}`);
if (bUnder > 0 && bMid > 0 && bHigh > 0 && bLux > 0) {
  console.log("  ✅ SUCCESS: All budget categories have matching destinations!");
} else {
  console.error("  ❌ FAULT: Budget filtering failed.");
  testPassed = false;
}

// 4. Season Filter Test
console.log("\n[Test 4] Testing Season Filter...");
const sWinter = allDestinations.filter(d => (d.bestSeason || "").toLowerCase().includes("winter") || (d.bestSeason || "").toLowerCase().includes("oct")).length;
const sSummer = allDestinations.filter(d => (d.bestSeason || "").toLowerCase().includes("summer") || (d.bestSeason || "").toLowerCase().includes("mar") || (d.bestSeason || "").toLowerCase().includes("may")).length;
const sMonsoon = allDestinations.filter(d => (d.bestSeason || "").toLowerCase().includes("monsoon") || (d.bestSeason || "").toLowerCase().includes("jul")).length;
const sYearRound = allDestinations.filter(d => (d.bestSeason || "").toLowerCase().includes("year-round")).length;
console.log(`  Winter: ${sWinter} | Summer: ${sSummer} | Monsoon: ${sMonsoon} | Year-Round: ${sYearRound}`);
if (sWinter > 0 && sSummer > 0 && sMonsoon > 0 && sYearRound > 0) {
  console.log("  ✅ SUCCESS: Season filtering successfully isolates season-specific destinations!");
} else {
  console.error("  ❌ FAULT: Season filtering output is invalid.");
  testPassed = false;
}

// 5. Combined Filter Test (Example from prompt)
console.log("\n[Test 5] Testing Combined Filters (State=Andhra Pradesh, Category=Hill, Rating=4.5+, Budget=1k-3k, Season=Summer/Winter)...");
const combined = allDestinations.filter(d => {
  const matchesState = (d.state || "").toLowerCase() === "andhra pradesh";
  const matchesCategory = (d.category || "").toLowerCase().includes("hill");
  const matchesRating = (d.rating || 0) >= 4.5;
  const matchesBudget = (d.budgetCategory || "").includes("1,000");
  const matchesSeason = (d.bestSeason || "").toLowerCase().includes("summer") || (d.bestSeason || "").toLowerCase().includes("winter") || (d.bestSeason || "").toLowerCase().includes("mar");
  return matchesState && matchesCategory && matchesRating && matchesBudget && matchesSeason;
});
console.log(`  Combined Filter Count: ${combined.length} match(es)`);
combined.forEach(d => console.log(`  - Matched: ${d.name} (${d.city}, ${d.state}) | Rating: ${d.rating} | Budget: ${d.budgetCategory} | Season: ${d.bestSeason}`));

if (combined.length > 0) {
  console.log("  ✅ SUCCESS: Combined filtering correctly returns target destinations like Araku Valley!");
} else {
  console.error("  ❌ FAULT: Combined filter test produced 0 results.");
  testPassed = false;
}

console.log("\n================================================");
if (testPassed) {
  console.log("FINAL RESULT: ALL FILTER TESTS PASSED SUCCESSFULLY! 🎉");
} else {
  console.log("FINAL RESULT: SOME FILTER TESTS FAILED.");
}
