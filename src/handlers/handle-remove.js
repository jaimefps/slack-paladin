const { db, isValidUser } = require("../database");

async function handleRemove({ intention: { userId, badge } }) {
  const badgeData = await db.findBadgeData(badge);

  if (!isValidUser(userId)) {
    throw new Error("Invalid userId when ACTION_TYPES.grant: " + userId);
  }
  if (!badgeData) {
    throw new Error("Unknown badge being granted: " + badge);
  }

  const user = await db.findOrCreateUser(userId);
  user.updatedAt = Date.now();
  const hasBadge = user.badges.includes(badge);
  if (hasBadge) {
    user.badges = user.badges.filter((element) => element !== badge);
    return `Removed ${badge} from <@${userId}>`;
  }
  return `<@${userId}> doesn't have that badge`;
}

module.exports = {
  handleRemove,
};
