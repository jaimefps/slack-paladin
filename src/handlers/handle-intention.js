const { ACTION_TYPES } = require("../constants");
const { handleGrant } = require("./handle-grant");
const { handleRemove } = require("./handle-remove");
const { handleReveal } = require("./handle-reveal");
const { handleHelp } = require("./handle-help");

async function handleIntention(data) {
  const {
    intention: { action },
  } = data;

  switch (action) {
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
     *  tomato,
     *  clean,
     */

    default:
      throw new Error(
        "Unknown invocation: " + action + `\n\n${await handleHelp()}`
      );
  }
}

module.exports = {
  handleIntention,
};
