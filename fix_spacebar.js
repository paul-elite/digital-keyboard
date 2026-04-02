const fs = require('fs');

let svg = fs.readFileSync('public/keyboard.svg', 'utf8');

const newGradients = `
<linearGradient id="paintSpaceOuter" x1="448.971" y1="336.976" x2="448.971" y2="394.476" gradientUnits="userSpaceOnUse">
<stop stop-color="#E6E6E6"/>
<stop offset="0.264423" stop-color="#E5E5E5"/>
<stop offset="0.461538" stop-color="#DBDBDB"/>
<stop offset="0.524038" stop-color="#E3E3E3"/>
<stop offset="0.639423" stop-color="#DFDFDF"/>
<stop offset="0.822115" stop-color="#E2E2E2"/>
<stop offset="1" stop-color="#DEDEDE"/>
</linearGradient>
<linearGradient id="paintSpaceInner" x1="600.292" y1="361.452" x2="297.652" y2="361.452" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="#E6E6E6"/>
</linearGradient>
`;

if (!svg.includes('id="paintSpaceOuter"')) {
  svg = svg.replace('</defs>', newGradients + '\n</defs>');
}

const outerRectRegex = /(<rect x="293.471"\s*y="336.976"\s*width="311"\s*height="57.5"[^>]*fill=")[^"]+(")/g;
svg = svg.replace(outerRectRegex, '$1url(#paintSpaceOuter)$2');

const innerRectRegex = /(<rect x="297.652"\s*y="337.872"\s*width="302.64"\s*height="47.16"[^>]*fill=")[^"]+(")/g;
svg = svg.replace(innerRectRegex, '$1url(#paintSpaceInner)$2');

fs.writeFileSync('public/keyboard.svg', svg);
console.log('Spacebar gradients injected and updated!');
