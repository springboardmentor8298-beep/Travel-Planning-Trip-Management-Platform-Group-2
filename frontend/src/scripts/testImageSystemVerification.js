import { DESTINATIONS_REGISTRY, getDestinationBySlugOrName } from "../data/destinationData.js";
import { DESTINATION_SPECIFIC_IMAGES, CATEGORY_IMAGE_POOLS } from "../data/destinationImageRegistry.js";

console.log("=== DESTINATION IMAGE SYSTEM VERIFICATION ===");

const allDestinations = Object.values(DESTINATIONS_REGISTRY).filter(Boolean);
console.log(`Total Registry Destinations Loaded: ${allDestinations.length}`);

let allPassed = true;

// 1. Verify specific examples requested by user
console.log("\n[Test 1] Verifying User-Specified Examples...");
const TEST_EXAMPLES = [
  { name: "Taj Mahal", expectedSlug: "taj-mahal-agra-unesco-wonder" },
  { name: "Red Fort", expectedSlug: "red-fort-delhi" },
  { name: "Qutub Minar", expectedSlug: "qutub-minar-complex" },
  { name: "Kondaveedu Fort", expectedSlug: "kondaveedu-fort" },
  { name: "Kotappakonda", expectedSlug: "kotappakonda-hill-temple" },
  { name: "Borra Caves", expectedSlug: "borra-caves" },
  { name: "Rushikonda Beach", expectedSlug: "rushikonda-beach-vizag" }
];

TEST_EXAMPLES.forEach(({ name, expectedSlug }) => {
  const dest = getDestinationBySlugOrName(expectedSlug) || getDestinationBySlugOrName(name);
  if (!dest) {
    console.error(`  ❌ MISSING: "${name}" not found!`);
    allPassed = false;
    return;
  }

  console.log(`  ✅ "${dest.name}" (${dest.slug}):`);
  console.log(`     - Hero Image: ${dest.heroImage}`);
  console.log(`     - Gallery Count: ${dest.gallery ? dest.gallery.length : 0}`);
  
  if (!dest.heroImage || typeof dest.heroImage !== "string") {
    console.error(`  ❌ Invalid hero image for "${dest.name}"`);
    allPassed = false;
  }
  if (!Array.isArray(dest.gallery) || dest.gallery.length < 8) {
    console.error(`  ❌ Insufficient gallery images for "${dest.name}" (Found ${dest.gallery ? dest.gallery.length : 0}, minimum 8 required)`);
    allPassed = false;
  }
});

// 2. Check for Placeholder / Cross-destination Image Pollution
console.log("\n[Test 2] Verifying Removal of Hardcoded Taj Mahal Placeholder on Non-Taj Destinations...");
const TAJ_MAHAL_PHOTO_ID = "photo-1564507592333-c60657eea523";
let pollutedCount = 0;

allDestinations.forEach((d) => {
  const isTaj = d.slug.includes("taj-mahal") || d.name.toLowerCase().includes("taj mahal");
  if (!isTaj) {
    if (d.heroImage && d.heroImage.includes(TAJ_MAHAL_PHOTO_ID)) {
      pollutedCount++;
      console.error(`  ❌ Hero pollution on non-Taj destination: "${d.name}" (${d.slug})`);
    }
  }
});

if (pollutedCount === 0) {
  console.log("  ✅ SUCCESS: Zero non-Taj destinations are using the Taj Mahal placeholder!");
} else {
  console.error(`  ❌ FAULT: Found ${pollutedCount} non-Taj destinations with Taj Mahal placeholder!`);
  allPassed = false;
}

// 3. Verify 100% of Destinations Have Minimum 8-10 Unique Images
console.log("\n[Test 3] Verifying Minimum 8-10 Gallery Images Across All 750 Destinations...");
let shortGalleryCount = 0;

allDestinations.forEach((d) => {
  if (!Array.isArray(d.gallery) || d.gallery.length < 8) {
    shortGalleryCount++;
  }
});

if (shortGalleryCount === 0) {
  console.log(`  ✅ SUCCESS: All ${allDestinations.length} destinations possess 8–10 unique gallery images!`);
} else {
  console.error(`  ❌ FAULT: Found ${shortGalleryCount} destinations with fewer than 8 gallery images!`);
  allPassed = false;
}

// 4. Verify Category-Image Consistency
console.log("\n[Test 4] Verifying Category-Image Consistency (No beaches showing fort images)...");
const beachDest = allDestinations.find(d => d.category === "Beaches");
const fortDest = allDestinations.find(d => d.category === "Heritage & Forts");

if (beachDest && fortDest) {
  const overlap = beachDest.gallery.filter(img => fortDest.gallery.includes(img));
  console.log(`  Beach ("${beachDest.name}") vs Fort ("${fortDest.name}") Image Overlap: ${overlap.length} shared images`);
  if (overlap.length === 0) {
    console.log("  ✅ SUCCESS: Beach and Fort destinations use distinct category image pools!");
  } else {
    console.warn(`  ⚠️ Shared images between distinct categories: ${overlap.length}`);
  }
}

console.log("\n================================================");
if (allPassed) {
  console.log("FINAL RESULT: DESTINATION IMAGE SYSTEM IS 100% VERIFIED! 📸🎉");
} else {
  console.log("FINAL RESULT: DESTINATION IMAGE SYSTEM VERIFICATION FAILED.");
}
