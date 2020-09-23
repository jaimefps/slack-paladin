import { SlackEvent } from "@slack/bolt";
import { Db } from "mongodb";
import { DB_COLLECTIONS } from "../constants";
import { TeamDoc } from "../types";

export async function findOrCreateTeam({
  event: { team },
  dbSingleton,
}: {
  event: SlackEvent;
  dbSingleton: Db;
}): Promise<TeamDoc> {
  const teamDoc: TeamDoc = {
    slackTeam: team,
    // etc
  };
  try {
    const result = await dbSingleton
      .collection(DB_COLLECTIONS.teams)
      .findOneAndUpdate(
        { slackTeam: team },
        { $setOnInsert: teamDoc },
        { returnOriginal: false, upsert: true }
      );
    return result.value;
  } catch (e) {
    console.error(e);
    throw new Error("Paladin failed to register your team in the system.");
  }
}
