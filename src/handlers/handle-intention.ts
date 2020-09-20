import { ACTION_TYPES } from "../constants";
import { handleGrant } from "./handle-grant";
import { handleRemove } from "./handle-remove";
import { handleReveal } from "./handle-reveal";
import { handleHelp } from "./handle-help";
import { CascadingData } from "src/types";

export async function handleIntention(data: CascadingData) {
  const { intention } = data;

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
        "Unknown invocation: " + intention.action + `\n\n${await handleHelp()}`
      );
  }
}
