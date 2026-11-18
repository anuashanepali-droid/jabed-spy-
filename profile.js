const MAX_TEXT = 80;

function cleanText(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value).replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
}

function normalizeProfile(input = {}) {
  const uid = cleanText(input.uid);
  const name = cleanText(input.name);
  if (!uid || !name) {
    const error = new Error("profile.uid and profile.name are required");
    error.status = 400;
    throw error;
  }

  const genderRaw = cleanText(input.gender, "unknown").toLowerCase();
  const gender = ["male", "female", "other", "unknown"].includes(genderRaw) ? genderRaw : "unknown";

  return {
    uid,
    name,
    username: cleanText(input.username, "Not provided"),
    gender,
    bio: cleanText(input.bio, "No bio available"),
    birthday: cleanText(input.birthday, "Not provided"),
    relationship: cleanText(input.relationship, "Not provided"),
    location: cleanText(input.location, "Not provided"),
    profileUrl: cleanText(input.profileUrl, ""),
    followers: cleanText(input.followers, "—"),
    friends: cleanText(input.friends, "—"),
    verified: Boolean(input.verified),
    source: cleanText(input.source, "Messenger profile"),
    updatedAt: new Date().toISOString()
  };
}

module.exports = { normalizeProfile };
