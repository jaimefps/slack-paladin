import { CascadingData } from "../types";
import { db, isValidUser } from "../database";

export async function handleRemove({
  intention: { userId, badge },
}: CascadingData) {
  const badgeData = await db.findBadgeData(badge);

  if (!isValidUser(userId)) {
    throw new Error("Invalid userId when removing badge");
  }

  if (!badgeData) {
    throw new Error("Unknown badge being granted: " + badge);
  }

  const user = await db.findOrCreateUser(userId);
  const hasBadge = user.badges.includes(badge);
  if (hasBadge) {
    user.badges = user.badges.filter((element) => element !== badge);
    return `Removed ${badge} from <@${userId}>`;
  }
  return `<@${userId}> doesn't have that badge`;
}
