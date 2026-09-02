import { getDestinationBySlugOrName } from "../data/destinationData.js";

const testTemples = [
  {
    name: "Tirumala Venkateswara Temple",
    query: "tirumala-venkateswara-temple",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPbd1E8pIf0B1SLME4UaMIuM5eKD3Q1vY2DREeT4iNSA&s=10",
    expectedGalleryCount: 5
  },
  {
    name: "Srisailam Mallikarjuna Temple",
    query: "srisailam-mallikarjuna-jyotirlinga",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa8G58YIw_-lqT-buzQddK5wDI_m5h95J7gny5AQ56Fw&s=10",
    expectedGalleryCount: 8
  },
  {
    name: "Kanaka Durga Temple",
    query: "kanaka-durga-temple",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR311gY4gK3gBqh-h8Q86y25sH1tpfHWvcLGThaWaA0Wg&s=10",
    expectedGalleryCount: 5
  },
  {
    name: "Srikalahasti Temple",
    query: "srikalahasti-temple",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5ndU5Hnc2iGzhgI5l3z9PHJtcqWcmDGPB7fLMZw30Cg&s=10",
    expectedGalleryCount: 5
  },
  {
    name: "Simhachalam Temple",
    query: "simhachalam-temple",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyfpP-ElA--y4rT_rDmgbrDCV2BN6nMJVQXBrxy6tDoA&s=10",
    expectedGalleryCount: 6
  },
  {
    name: "Ahobilam Temple",
    query: "ahobilam-nava-narasimha-temples",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPpKlZZjij0Odath8A9ex6Y8bWYcrK1fR9HAHwz1Dpw&s",
    expectedGalleryCount: 5
  },
  {
    name: "Kotappakonda",
    query: "kotappakonda-hill-temple",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm63376p6OQm57lSbir6Sn74ieHTm66_Gob5iud5kryg&s=10",
    expectedGalleryCount: 6
  },
  {
    name: "Mahanandi Temple",
    query: "mahanandi-temple-spring-pools",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR6bImMHWZWNN68kl67eE--WypyBjUVNctkykj_2TlRg&s=10",
    expectedGalleryCount: 6
  },
  {
    name: "Annavaram Temple",
    query: "annavaram-temple",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNwLkzTzybvpJ6c0RAdAJSPxB_mhnLAX9r8OZ27oUSuA&s=10",
    expectedGalleryCount: 5
  },
  {
    name: "Draksharamam Temple",
    query: "draksharamam-temple",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzscBghEGncYF0NTT2bUSdQFdn6Cxew_Y-Kr9GacA9iw&s=10",
    expectedGalleryCount: 5
  },
  {
    name: "Lepakshi Temple",
    query: "veerabhadra-temple-lepakshi",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2sqy0kNI_l7dTYzBJMtMl2-ZZYXsS6NS9pmyGZ91IYA&s=10",
    expectedGalleryCount: 4
  },
  {
    name: "Penchalakona Temple",
    query: "penchalakona-temple-waterfalls",
    expectedHero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH7ibRCwqkqnHtosKo3-8MSQvJphpOU7ug9IvmOpzEVA&s=10",
    expectedGalleryCount: 5
  }
];

console.log("=== TESTING ANDHRA PRADESH TEMPLES & SPIRITUAL IMAGE UPDATES ===");
let passed = 0;

testTemples.forEach(({ name, query, expectedHero, expectedGalleryCount }) => {
  const dest = getDestinationBySlugOrName(query);

  const heroMatch = dest?.heroImage === expectedHero;
  const galleryMatch = dest?.gallery?.length === expectedGalleryCount;

  if (dest && heroMatch && galleryMatch) {
    console.log(`[PASS] ${name}: Hero & ${dest.gallery.length} Gallery images matched exactly!`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}: Hero match: ${heroMatch} (${dest?.heroImage}) | Gallery len: ${dest?.gallery?.length} (expected ${expectedGalleryCount})`);
  }
});

console.log(`\nResult: ${passed}/${testTemples.length} AP Temple destinations verified successfully.`);
if (passed === testTemples.length) {
  console.log("SUCCESS: All 12 Andhra Pradesh Temples & Spiritual image updates verified perfectly!");
} else {
  process.exit(1);
}
