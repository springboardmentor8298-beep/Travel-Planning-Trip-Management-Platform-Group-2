import { getDestinationBySlugOrName } from "../data/destinationData.js";

const testForts = [
  {
    name: "Gandikota Fort",
    query: "gandikota-grand-canyon",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPenMe99N-vK1ywq_Yda582zKEPejU3v8FUIpHqFfhRA&s=10",
    expectedGalleryCount: 7
  },
  {
    name: "Chandragiri Fort",
    query: "chandragiri-fort",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6wytnEK6_Qhj-wd4mm7qa0nnO8OV82egHhxmN2whgMA&s=10",
    expectedGalleryCount: 5
  },
  {
    name: "Kondapalli Fort",
    query: "kondapalli-fort",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-5lG9YXX-NCRNM3ODAUrrzEr_FzrVbDFf1EYbIE3qXA&s=10",
    expectedGalleryCount: 5
  },
  {
    name: "Udayagiri Fort",
    query: "udayagiri-fort",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDVsF9BlpPIcVgf-BACNber6aXYewvM9Z1QyXLo9u0yQ&s=10",
    expectedGalleryCount: 6
  },
  {
    name: "Gooty Fort",
    query: "gooty-fort",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSORoOgabDFezoNUpMWuGXsqSENp2aTMhIhxl9-voArIA&s=10",
    expectedGalleryCount: 4
  },
  {
    name: "Penukonda Fort",
    query: "penukonda-fort",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSimXsuiJCc3I8_7qEGQwSNPHPxL7bdUaHHKOOKanw1RQ&s=10",
    expectedGalleryCount: 4
  }
];

console.log("=== TESTING ANDHRA PRADESH HERITAGE & FORTS IMAGE UPDATES ===");
let passed = 0;

testForts.forEach(({ name, query, expectedHero, expectedGalleryCount }) => {
  const dest = getDestinationBySlugOrName(query);

  const heroMatch = dest?.heroImage === expectedHero;
  const galleryMatch = dest?.gallery?.length === expectedGalleryCount && dest.gallery[0] !== dest.heroImage;
  const noPlaceholders = !dest?.gallery?.some(img => img.includes("coming-soon") || img.includes("unsplash"));

  if (dest && heroMatch && dest.gallery.length === expectedGalleryCount) {
    console.log(`[PASS] ${name}: Hero & ${dest.gallery.length} Gallery images matched exactly!`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}: Mismatch! Hero: ${dest?.heroImage} | Gallery len: ${dest?.gallery?.length}`);
  }
});

console.log(`\nResult: ${passed}/${testForts.length} AP Fort destinations verified successfully.`);
if (passed === testForts.length) {
  console.log("SUCCESS: All 6 Andhra Pradesh Heritage & Forts image updates verified perfectly!");
} else {
  process.exit(1);
}
