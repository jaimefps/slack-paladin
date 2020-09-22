import { findOrCreateUser } from "../../database/user-facade";
import { BadgeDoc, CascadingData, UserDoc } from "../../types";
import { DB_COLLECTIONS } from "../../constants";

export async function handleWhoami({
  dbSingleton,
  event: { user, team },
}: CascadingData): Promise<string> {
  let userDoc: UserDoc;
  let badgeDocs: BadgeDoc[];

  try {
    // get user data:
    userDoc = await findOrCreateUser({
      dbSingleton,
      user: user,
      team,
    });
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to find or register you in the system.`);
  }

  if (userDoc.badges.length < 1) {
    return `You don't have any badges... yet!`;
  }

  try {
    // find badges by ids:
    badgeDocs = await dbSingleton
      .collection(DB_COLLECTIONS.badges)
      .find({ _id: { $in: userDoc.badges } })
      .toArray();
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to lookup your badges.`);
  }

  return `${badgeDocs.map((d) => d.emoji).join(" ")}`;
}
