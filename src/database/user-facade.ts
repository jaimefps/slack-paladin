import { Db, ObjectId } from "mongodb";
import { DB_COLLECTIONS } from "../constants";
import { UserDoc } from "../types";
import { areSameId } from "./utils";

export async function findOrCreateUser({
  dbSingleton,
  user,
  team,
}: {
  dbSingleton: Db;
  user: string;
  team: string;
}): Promise<UserDoc> {
  const userDoc: UserDoc = {
    badges: [],
    domains: [],
    slackTeam: team,
    slackUser: user,
  };

  try {
    const result = await dbSingleton
      .collection(DB_COLLECTIONS.users)
      .findOneAndUpdate(
        { slackUser: user },
        { $setOnInsert: userDoc },
        { returnOriginal: false, upsert: true }
      );
    return result.value;
  } catch (e) {
    throw new Error("Paladin failed to register user");
  }
}

export function userHasBadge(userDoc: UserDoc, badgeId: ObjectId): boolean {
  return !!userDoc.badges.find((id) => areSameId(badgeId, id));
}
