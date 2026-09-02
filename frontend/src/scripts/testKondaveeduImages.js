import { getDestinationBySlugOrName } from "../data/destinationData.js";

console.log("=== VERIFYING KONDAVEEDU FORT IMAGE UPDATES ===");

const dest = getDestinationBySlugOrName("kondaveedu-fort");

const expectedHero = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDrG5Bvwax9mXp0QquW7bLQ4569k9vkRIUOFE3ajYgpw&s=10";
const expectedGalleryCount = 6;

console.log("Resolved Hero Image:", dest?.heroImage);
console.log("Resolved Gallery Count:", dest?.gallery?.length);

if (dest?.heroImage === expectedHero && dest?.gallery?.length === expectedGalleryCount) {
  console.log("✅ VERIFICATION PASSED: Kondaveedu Fort hero and gallery images updated successfully!");
} else {
  console.error("❌ VERIFICATION FAILED: Kondaveedu Fort image update mismatch!");
  process.exit(1);
}
