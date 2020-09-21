import { handleGrant } from "./handle-grant";
import { handleRemove } from "./handle-remove";
import { handleReveal } from "./handle-reveal";
import { handleHelp } from "./handle-help";
import { CascadingData } from "../types";
import { ACTION_TYPES } from "../constants";
import { findOrCreateUser } from "../database/user-facade";
import { getIntention } from "./helpers";

export async function handleIntention(data: CascadingData): Promise<string> {
  const { context, event, dbSingleton } = data;
  const intention = getIntention({ context, event });

  if (!ACTION_TYPES[intention.action]) {
    throw new Error(
      "Unknown invocation: " + intention.action + `\n\n${await handleHelp()}`
    );
  }

  const actor = await findOrCreateUser({
    dbSingleton,
    team: event.team,
    user: event.user,
  });

  if (!actor) {
    throw new Error(
      `Paladin server unable to find or create <@${event.user}>.`
    );
  }

  // const hasPermission = await actorIsAllowed({
  //   intention,
  //   context,
  //   event,
  //   actor,
  // });

  // if (!hasPermission) {
  //   throw new Error(
  //     `<@${event.user}> does not have permission to do that.`
  //   );
  // }

  switch (intention.action) {
    case ACTION_TYPES.help:
      return await handleHelp();
    case ACTION_TYPES.grant:
      return await handleGrant(data);
    case ACTION_TYPES.remove:
      return await handleRemove(data);
    case ACTION_TYPES.reveal:
      return await handleReveal(data);

    /**
     * TODO handle:
     *  promote,
     *  exile,
     *  whoami,
     *  listBadges,
     *  listDomains
     *
     *
     *  tomato,
     *  clean,
     */

    default:
      throw new Error(
        `Paladin server couldn't execute your request: ${
          intention.action
        }\n\n${await handleHelp()}`
      );
  }
}
