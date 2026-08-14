const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create PNG file with raw RGBA buffer using pure Node.js
function createPNG(width, height, getPixelRGBA) {
  const rowSize = width * 4 + 1; // 1 filter byte per row
  const rawBuffer = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawBuffer[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawBuffer[pxOffset] = r;
      rawBuffer[pxOffset + 1] = g;
      rawBuffer[pxOffset + 2] = b;
      rawBuffer[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawBuffer);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type), data]));
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

// Simple CRC32 implementation for PNG
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff);
}

// TripNest Brand Icon generator (Emerald gradient background with compass/travel pin design)
function tripnestIconPainter(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2 - 4;

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Rounded rectangle background (Squircle radius 22%)
  const cornerR = w * 0.24;
  const inX = Math.abs(x - cx) <= (w / 2 - cornerR);
  const inY = Math.abs(y - cy) <= (h / 2 - cornerR);
  const cornerDist = Math.hypot(
    Math.max(0, Math.abs(x - cx) - (w / 2 - cornerR)),
    Math.max(0, Math.abs(y - cy) - (h / 2 - cornerR))
  );

  if (cornerDist > cornerR) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Smooth Emerald gradient (top-left: #10b981, bottom-right: #0284c7)
  const t = (x + y) / (w + h);
  const bgR = Math.round(16 * (1 - t) + 2 * t);
  const bgG = Math.round(185 * (1 - t) + 132 * t);
  const bgB = Math.round(129 * (1 - t) + 199 * t);

  // Draw Compass / Pin in center
  const scale = w / 100; // 100 base coordinate system
  const nx = (x - cx) / scale;
  const ny = (y - cy) / scale;

  // Outer circle ring
  const ringDist = Math.hypot(nx, ny);
  if (ringDist >= 26 && ringDist <= 31) {
    return [255, 255, 255, 240];
  }

  // Compass needle (Diamond/Star shape)
  // Top-Right Needle (White)
  const inNeedleTop = ny <= -nx && ny >= nx - 28 && ny <= -nx + 28 && nx >= 0 && ny <= 0;
  // Let's make an elegant compass needle
  const isNeedleNorth = (Math.abs(nx) <= 5 && ny >= -26 && ny <= 0) ||
                        (Math.abs(nx) <= (26 + ny) * 0.4 && ny >= -26 && ny <= 0);
  const isNeedleSouth = (Math.abs(nx) <= 5 && ny >= 0 && ny <= 26) ||
                        (Math.abs(nx) <= (26 - ny) * 0.4 && ny >= 0 && ny <= 26);
  const isNeedleEast = (Math.abs(ny) <= 5 && nx >= 0 && nx <= 26) ||
                       (Math.abs(ny) <= (26 - nx) * 0.4 && nx >= 0 && nx <= 26);
  const isNeedleWest = (Math.abs(ny) <= 5 && nx >= -26 && nx <= 0) ||
                       (Math.abs(ny) <= (26 + nx) * 0.4 && nx >= -26 && nx <= 0);

  // Center circle
  if (ringDist <= 6) {
    return [255, 255, 255, 255];
  }

  if (isNeedleNorth && nx >= 0) {
    return [255, 255, 255, 255]; // Bright white North-East
  } else if (isNeedleNorth && nx < 0) {
    return [220, 240, 235, 230]; // Soft white North-West
  }

  if (isNeedleSouth && nx >= 0) {
    return [15, 23, 42, 230]; // Deep navy South-East
  } else if (isNeedleSouth && nx < 0) {
    return [30, 41, 59, 210]; // Deep navy South-West
  }

  if (isNeedleEast || isNeedleWest) {
    return [240, 253, 250, 220];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.join(__dirname, 'public');

console.log('Generating PWA icons...');
const icon192 = createPNG(192, 192, tripnestIconPainter);
fs.writeFileSync(path.join(publicDir, 'logo192.png'), icon192);
console.log('Generated logo192.png');

const icon512 = createPNG(512, 512, tripnestIconPainter);
fs.writeFileSync(path.join(publicDir, 'logo512.png'), icon512);
console.log('Generated logo512.png');

const appleIcon = createPNG(180, 180, tripnestIconPainter);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('Generated apple-touch-icon.png');

const favicon = createPNG(64, 64, tripnestIconPainter);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon);
console.log('Generated favicon.png');

console.log('All PWA icons generated successfully!');
