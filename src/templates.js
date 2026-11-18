const templates = [
  { id: "neon", name: "Neon Pulse", description: "Electric blue and violet gaming look" },
  { id: "royal", name: "Royal Gold", description: "Dark premium background with gold accents" },
  { id: "midnight", name: "Midnight", description: "Clean dark monochrome layout" },
  { id: "ocean", name: "Ocean Wave", description: "Cool cyan and deep-blue layout" },
  { id: "crimson", name: "Crimson Edge", description: "Bold red and charcoal layout" },
  { id: "emerald", name: "Emerald Aura", description: "Green and dark premium layout" }
];

const themes = {
  neon:     { bg1: "#10142e", bg2: "#30206b", accent: "#58e7ff", accent2: "#b76cff" },
  royal:    { bg1: "#17130d", bg2: "#493516", accent: "#f5d27a", accent2: "#fff0c2" },
  midnight: { bg1: "#101318", bg2: "#252d39", accent: "#d8e1ee", accent2: "#8e9bad" },
  ocean:    { bg1: "#071e32", bg2: "#07536a", accent: "#65f0e5", accent2: "#80bfff" },
  crimson:  { bg1: "#210e17", bg2: "#641d32", accent: "#ff647c", accent2: "#ffb0a2" },
  emerald:  { bg1: "#071e19", bg2: "#15513d", accent: "#65e6ad", accent2: "#c1ffd9" }
};

function getTemplate(id) {
  return themes[id] ? { id, ...themes[id] } : null;
}

module.exports = { templates, getTemplate };
