// Test using fontkit
const fontkit = require('fontkit');
const fs = require('fs');

const FONT_PATH = './AppleColorEmoji.ttf';

// open a font synchronously
var font = fontkit.openSync(FONT_PATH);

// layout a string, using default shaping features.
// returns a GlyphRun, describing glyphs and positions.
var run = font.layout('U+1F600');

console.log(run);

// create a font subset
var subset = font.createSubset();
run.glyphs.forEach(function(glyph) {
  subset.includeGlyph(glyph);
});

// let buffer = subset.encode();

// fs.writeFileSync('test.ttf', buffer);

fs.closeSync(fd);