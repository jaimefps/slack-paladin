const { db, isValidUser } = require("../database");

async function handleGrant({ intention, context, event }) {
  const { userId, badge, action } = intention;
  const thisBadgeData = await db.findBadgeData(badge);

  if (!isValidUser(userId)) {
    throw new Error("Invalid userId when ACTION_TYPES.grant: " + userId);
  }
  if (!thisBadgeData) {
    throw new Error("Unknown badge being granted: " + badge);
  }

  const targetUser = await db.findOrCreateUser(userId);
  const hasBadge = targetUser.badges.includes(badge);
  if (hasBadge) return `<@${userId}> already has the ${badge} badge`;

  targetUser.badges.push(badge);
  return `${badge} badge granted to <@${userId}>`;
}

module.exports = {
  handleGrant,
};
