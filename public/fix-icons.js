const fs = require('fs')

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#1a1a2e"/>
  <path d="M50 15 Q32 15 26 30 Q20 45 28 55 Q33 62 40 64 L40 72 Q40 75 43 75 L57 75 Q60 75 60 72 L60 64 Q67 62 72 55 Q80 45 74 30 Q68 15 50 15Z" fill="none" stroke="#3ECF8E" stroke-width="3" stroke-linejoin="round"/>
  <line x1="50" y1="15" x2="50" y2="75" stroke="#3ECF8E" stroke-width="2" opacity="0.4"/>
  <line x1="27" y1="38" x2="73" y2="38" stroke="#3ECF8E" stroke-width="2" opacity="0.4"/>
  <line x1="29" y1="52" x2="71" y2="52" stroke="#3ECF8E" stroke-width="2" opacity="0.4"/>
  <text x="50" y="92" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="#3ECF8E" letter-spacing="1">EpiSafe</text>
</svg>`

const icons = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#1a1a2e"/>
  <path d="M256 75 Q164 75 133 155 Q102 232 143 280 Q168 310 200 320 L200 368 Q200 384 216 384 L296 384 Q312 384 312 368 L312 320 Q344 310 369 280 Q410 232 379 155 Q348 75 256 75Z" fill="none" stroke="#3ECF8E" stroke-width="16" stroke-linejoin="round"/>
  <line x1="256" y1="75" x2="256" y2="384" stroke="#3ECF8E" stroke-width="10" opacity="0.4"/>
  <line x1="136" y1="190" x2="376" y2="190" stroke="#3ECF8E" stroke-width="10" opacity="0.4"/>
  <line x1="142" y1="268" x2="370" y2="268" stroke="#3ECF8E" stroke-width="10" opacity="0.4"/>
  <text x="256" y="460" text-anchor="middle" font-family="Arial,sans-serif" font-size="60" font-weight="bold" fill="#3ECF8E" letter-spacing="4">EpiSafe</text>
</svg>`

fs.writeFileSync('public/favicon.svg', favicon)
fs.writeFileSync('public/icons.svg', icons)
console.log('Done! Icons written successfully.')