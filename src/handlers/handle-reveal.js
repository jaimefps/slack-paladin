const { db, isValidUser } = require("../database");

async function handleReveal({ intention: { userId } }) {
  if (!isValidUser(userId))
    throw new Error("Invalid userId when ACTION_TYPES.reveal: " + userId);
  const user = await db.findOrCreateUser(userId);
  return user.badges.join(" ") || "No badges... yet!";
}

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

  const actor = await db.findOrCreateUser(event.user);
  const actorHasPermission = await actorIsAllowed({
    intention,
    context,
    event,
    actor,
  });

  console.log("hasPermission:", actorHasPermission);

  // if (!actorHasPermission) {
  //   throw new Error(
  //     `<@${event.user}> is not allowed to ${action} in this context.`
  //   );
  // }

  targetUser.badges.push(badge);
  return `${badge} badge granted to <@${userId}>`;
}

module.exports = {
  handleReveal,
};
