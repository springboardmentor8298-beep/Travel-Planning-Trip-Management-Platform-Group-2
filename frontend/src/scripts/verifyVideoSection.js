import { DESTINATIONS_REGISTRY } from "../data/destinationData.js";

console.log("=================================================");
console.log("VERIFYING YOUTUBE VIDEO SECTION & SCHEMA FIELDS");
console.log("=================================================");

const items = Object.values(DESTINATIONS_REGISTRY).filter(Boolean);
console.log(`Total Master Destinations Inspected: ${items.length}`);

let totalWithVideo = 0;
let totalNullVideo = 0;
let invalidVideoCount = 0;

items.forEach((item) => {
  const yt = item.youtubeVideo;
  if (yt) {
    if (yt.includes("dQw4w9WgXcQ") || yt.includes("search_query") || !yt.startsWith("https://www.youtube.com/embed/")) {
      invalidVideoCount++;
      console.error(`❌ INVALID VIDEO URL for "${item.name}":`, yt);
    } else {
      totalWithVideo++;
    }
  } else {
    totalNullVideo++;
  }
});

console.log("-------------------------------------------------");
console.log(`✓ Destinations with Verified YouTube Video: ${totalWithVideo}`);
console.log(`✓ Destinations with Clean Null Video (Section Hidden): ${totalNullVideo}`);

if (invalidVideoCount === 0) {
  console.log("SUCCESS: 0 invalid / Rickroll / placeholder videos detected!");
} else {
  console.error(`FAILURE: Found ${invalidVideoCount} invalid video entries!`);
  process.exit(1);
}
console.log("=================================================");
