import { CascadingData } from "../types";
import { db, isValidUser } from "../database";

export async function handleReveal({ intention: { userId } }: CascadingData) {
  if (!isValidUser(userId)) throw new Error("Invalid userId when revealing");
  const user = await db.findOrCreateUser(userId);
  return user.badges.join(" ") || `<@${userId}> has no badges... yet!`;
}
