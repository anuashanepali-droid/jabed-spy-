const profiles = new Map();
const TTL_MS = 30 * 60 * 1000;

function saveProfile(profile) {
  profiles.set(profile.uid, { profile, savedAt: Date.now() });
}

function getProfile(uid) {
  const item = profiles.get(String(uid));
  if (!item) return null;
  if (Date.now() - item.savedAt > TTL_MS) {
    profiles.delete(String(uid));
    return null;
  }
  return item.profile;
}

module.exports = { saveProfile, getProfile };
