import { ACTION_TYPES } from "../../constants";
import { Intention, CascadingRoot } from "../../types";
import { getTextAction } from "./helpers";
import {
  makeHelp,
  makeWhoami,
  makeReveal,
  makeList,
  makeDemote,
  makeForge,
  makeGrant,
  makePromote,
  makeUnearth,
  makeRemove,
} from "./factories";

/**
 * root
 *
 */
export function createIntention(data: CascadingRoot): Intention {
  const action = getTextAction(data);

  switch (action) {
    case ACTION_TYPES.help:
      return makeHelp();

    case ACTION_TYPES.whoami:
      return makeWhoami();

    // bard action:
    case ACTION_TYPES.reveal:
      return makeReveal(data);

    // reveal badges|domains
    case ACTION_TYPES.list:
      return makeList(data);

    case ACTION_TYPES.unearth:
      return makeUnearth(data);

    case ACTION_TYPES.forge:
      return makeForge(data);

    case ACTION_TYPES.grant:
      return makeGrant(data);

    case ACTION_TYPES.remove:
      return makeRemove(data);

    case ACTION_TYPES.promote:
      return makePromote(data);

    case ACTION_TYPES.demote:
      return makeDemote(data);

    default:
      return {
        action: null,
      };
  }
}
