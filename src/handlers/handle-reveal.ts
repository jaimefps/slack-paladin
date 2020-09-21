import { CascadingData } from "../types";
import { db, isValidUser } from "../database";

export async function handleReveal({ intention: { targetId } }: CascadingData) {
  if (!isValidUser(targetId))
    throw new Error("Invalid targetId when revealing");
  const user = await db.findOrCreateUser(targetId);
  return user.badges.join(" ") || `<@${targetId}> has no badges... yet!`;
}
