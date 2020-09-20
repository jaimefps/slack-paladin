import { CascadingData } from "../types";
import { db, isValidUser } from "../database";

export async function handleGrant({
  intention: { userId, badge },
}: CascadingData) {
  const thisBadgeData = await db.findBadgeData(badge);

  if (!isValidUser(userId)) {
    throw new Error(`Invalid userId when granting to badge`);
  }

  if (!thisBadgeData) {
    throw new Error(`Unknown badge being granted: ${badge}`);
  }

  const targetUser = await db.findOrCreateUser(userId);
  if (targetUser.badges.includes(badge))
    return `<@${userId}> already has ${badge}.`;

  try {
    await db.grantBadgeToUser(userId, badge);
    return `${badge} badge granted to <@${userId}>`;
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to grant Badge to <@${userId}>, please try again`);
  }
}
