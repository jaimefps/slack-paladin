import { handleGrant } from "./handle-grant";
import { handleRemove } from "./handle-remove";
import { handleReveal } from "./handle-reveal";
import { handleHelp } from "./handle-help";
import { CascadingData } from "../../types";
import { ACTION_TYPES } from "../../constants";
import { findOrCreateUser } from "../../database/user-facade";
import { createIntention } from "../intentions";
import { actorIsAllowed } from "../permissions";
import { handleUnearth } from "./handle-unearth";
import { handleWhoami } from "./handle-whoami";
import { handleList } from "./handle-list";

/**
 * root
 *
 */
export async function handleIntention(data: CascadingData): Promise<string> {
  const { context, event, dbSingleton } = data;

  if (!event.team) {
    throw new Error(
      "Paladin failed to detect what team this request is coming from."
    );
  }

  const actor = await findOrCreateUser({
    dbSingleton,
    team: event.team,
    user: event.user,
  });

  if (!actor) {
    throw new Error(`Paladin failed to find or register <@${event.user}>.`);
  }

  const intention = createIntention({
    actor: null,
    context,
    dbSingleton: null,
    event,
  });

  const hasPermission = await actorIsAllowed(
    { actor, context, dbSingleton: null, event },
    intention
  );

  if (!hasPermission) {
    throw new Error(
      `<@${actor.slackUser}> does not have permission to do that.`
    );
  }

  switch (intention.action) {
    case ACTION_TYPES.help:
      return await handleHelp();

    case ACTION_TYPES.grant:
      return await handleGrant(data, intention);

    case ACTION_TYPES.remove:
      return await handleRemove(data, intention);

    // bard action
    case ACTION_TYPES.reveal:
      return await handleReveal(data, intention);

    case ACTION_TYPES.unearth:
      return await handleUnearth(data, intention);

    case ACTION_TYPES.whoami:
      return await handleWhoami(data);

    // reveal badges|domains:
    case ACTION_TYPES.list:
      return await handleList(data, intention);

    /**
     * TODO handle:
     *
     *  promote
     *  demote
     *  forge
     *
     *  tomato
     *  clean
     */
    default:
      throw new Error(
        `Paladin failed to understand your intentions:\n\n${await handleHelp()}`
      );
  }
}
