import { Db } from "mongodb";
import { Context as SlackContext, SlackEvent } from "@slack/bolt";
import { Intention, TeamDoc } from "../../types";

export async function teamIsAllowed(
  {}: {
    context: SlackContext;
    event: SlackEvent;
    dbSingleton: Db;
    team: TeamDoc;
  },
  _: Intention
) {
  return true;
}
