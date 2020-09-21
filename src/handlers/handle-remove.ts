import { CascadingData } from "../types";
import { db, isValidUser } from "../database";

export async function handleRemove({
  intention: { targetId, badge },
}: CascadingData) {
  const badgeData = await db.findBadgeData(badge);

  if (!isValidUser(targetId)) {
    throw new Error("Invalid targetId when removing badge");
  }

  if (!badgeData) {
    throw new Error("Unknown badge being granted: " + badge);
  }

  const user = await db.findOrCreateUser(targetId);
  const hasBadge = user.badges.includes(badge);
  if (hasBadge) {
    user.badges = user.badges.filter((element) => element !== badge);
    return `Removed ${badge} from <@${targetId}>`;
  }
  return `<@${targetId}> doesn't have that badge`;
}
