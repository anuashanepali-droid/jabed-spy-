const sharp = require("sharp");

function esc(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function wrap(value, max = 25) {
  const words = String(value || "").split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

// Decorative full-body anime-inspired silhouette, not a head/avatar.
function characterSvg(accent) {
  return `
  <g opacity="0.96" transform="translate(0,0)">
    <ellipse cx="760" cy="670" rx="112" ry="18" fill="#000" opacity=".28"/>
    <path d="M700 250 Q675 195 725 160 Q780 120 823 174 Q850 212 815 260
      Q790 282 745 270 Z" fill="#111827" stroke="${accent}" stroke-width="5"/>
    <path d="M724 264 L802 264 L824 315 L797 360 L730 360 L704 314 Z"
      fill="#172033" stroke="${accent}" stroke-width="4"/>
    <path d="M710 304 L660 355 L625 495 L660 510 L724 390 L746 350 Z"
      fill="#1d2940" stroke="${accent}" stroke-width="5"/>
    <path d="M811 304 L862 350 L888 470 L854 486 L800 390 L780 350 Z"
      fill="#1d2940" stroke="${accent}" stroke-width="5"/>
    <path d="M731 356 L804 356 L828 505 L803 590 L744 590 L710 500 Z"
      fill="#202d47" stroke="${accent}" stroke-width="5"/>
    <path d="M744 575 L798 575 L790 655 L770 665 L746 655 Z"
      fill="#111827" stroke="${accent}" stroke-width="4"/>
    <path d="M744 645 L790 645 L810 680 L728 680 Z" fill="#090e18" stroke="${accent}" stroke-width="4"/>
    <path d="M804 575 L849 575 L860 650 L842 665 L805 650 Z"
      fill="#111827" stroke="${accent}" stroke-width="4"/>
    <path d="M836 642 L866 642 L891 680 L817 680 Z" fill="#090e18" stroke="${accent}" stroke-width="4"/>
    <path d="M710 380 L820 380 L812 420 L720 420 Z" fill="${accent}" opacity=".22"/>
    <path d="M742 282 L782 282" stroke="${accent}" stroke-width="3" opacity=".8"/>
  </g>`;
}

function makeSvg(profile, theme, templateId) {
  const nameLines = wrap(profile.name, 22);
  const nameText = nameLines.map((line, i) =>
    `<text x="72" y="${270 + i * 62}" class="name">${esc(line)}</text>`).join("");
  const info = [
    ["USERNAME", profile.username],
    ["GENDER", profile.gender],
    ["LOCATION", profile.location],
    ["RELATIONSHIP", profile.relationship],
    ["BIRTHDAY", profile.birthday],
    ["FOLLOWERS", profile.followers]
  ];
  const infoSvg = info.map((item, i) => {
    const y = 430 + i * 43;
    return `<text x="76" y="${y}" class="label">${esc(item[0])}</text>
      <text x="250" y="${y}" class="value">${esc(item[1])}</text>`;
  }).join("");
  const badge = profile.verified ? "VERIFIED" : "PROFILE CARD";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="720" viewBox="0 0 1000 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.bg1}"/><stop offset="1" stop-color="${theme.bg2}"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${theme.accent}"/><stop offset="1" stop-color="${theme.accent2}"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <style>
      .name{font:700 48px Arial,sans-serif;fill:#fff}
      .label{font:700 13px Arial,sans-serif;letter-spacing:2px;fill:${theme.accent}}
      .value{font:500 18px Arial,sans-serif;fill:#f5f7fb}
      .small{font:600 14px Arial,sans-serif;letter-spacing:3px;fill:${theme.accent2}}
    </style>
  </defs>
  <rect width="1000" height="720" rx="34" fill="url(#bg)"/>
  <circle cx="830" cy="170" r="210" fill="${theme.accent}" opacity=".08"/>
  <circle cx="120" cy="650" r="240" fill="${theme.accent2}" opacity=".06"/>
  <path d="M35 35 H965 V685 H35 Z" fill="none" stroke="url(#line)" stroke-width="3" opacity=".75"/>
  <path d="M55 95 H610" stroke="url(#line)" stroke-width="5" filter="url(#glow)"/>
  <text x="72" y="75" class="small">JABED • SPY PROFILE</text>
  <rect x="72" y="112" width="175" height="32" rx="16" fill="${theme.accent}" opacity=".18"/>
  <text x="90" y="134" class="label">${badge}</text>
  ${nameText}
  <text x="76" y="365" class="small">${esc(templateId.toUpperCase())} EDITION</text>
  <path d="M72 390 H580" stroke="${theme.accent}" stroke-width="1.5" opacity=".5"/>
  ${infoSvg}
  ${characterSvg(theme.accent)}
  <text x="72" y="670" class="small">UID: ${esc(profile.uid)}</text>
  <text x="925" y="670" text-anchor="end" class="small">JABED NO SEKAI</text>
  </svg>`;
}

async function renderProfileCard(profile, theme, templateId) {
  const svg = Buffer.from(makeSvg(profile, theme, templateId));
  return sharp(svg).png({ compressionLevel: 9 }).toBuffer();
}

module.exports = { renderProfileCard };
