import { findOrCreateUser } from "../../database/user-facade";
import { BadgeDoc, CascadingData, RevealIntention, UserDoc } from "../../types";
import { DB_COLLECTIONS } from "../../constants";

export async function handleReveal(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId }: RevealIntention
): Promise<string> {
  let userDoc: UserDoc;
  let badgeDocs: BadgeDoc[];

  try {
    // get user data:
    userDoc = await findOrCreateUser({
      dbSingleton,
      user: targetId,
      team,
    });
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to find or register: <@${targetId}>`);
  }

  if (userDoc.badges.length < 1) {
    return `<@${targetId}> doesn't have any badges... yet!`;
  }

  try {
    // find badges by ids:
    badgeDocs = await dbSingleton
      .collection(DB_COLLECTIONS.badges)
      .find({ _id: { $in: userDoc.badges } })
      .toArray();
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to lookup badges for: <@${targetId}>`);
  }

  return `${badgeDocs.map((d) => d.emoji).join(" ")}`;
}
