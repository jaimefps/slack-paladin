const { ACTION_TYPES } = require("./constants");
const { db } = require("./database");

async function actorIsAllowed({ context, event, intention, actor }) {
  const { domains } = actor;
  const { action, badge: badgeOrDomain } = intention;

  // switch (action) {
  //   // must be paladin in that badge's domain:
  //   case ACTION_TYPES.grant:
  //   case ACTION_TYPES.remove:
  //     const { domains: badgeDomains } = await db.findBadgeData(badgeOrDomain);
  //     const overlap = domains.filter((value) => badgeDomains.includes(value));
  //   // if (overlap.length > 0) {
  //   //   const isPaladin = overlap.find(dom => dom.)
  //   // } else {
  //   //   isAllowed = false;
  //   // }
  //   // must be admin in that domain:
  //   // case ACTION_TYPES.promote:
  //   // case ACTION_TYPES.exile:
  //   //   const
  //   // const userDomain = domains.find((d) => d === domain);
  //   // const userRole = userDomain && userDomain.role;
  //   // if (!ROLE_TYPES[userRole].includes(action))
  //   //   throw new Error(`Caller does not have sufficient permissions to .`);
  //   default:
  //     return false;
  // }

  return true;
}

function getIntention({ event: { text } }) {
  // IMPORTANT: badge = badge|domain. // TODO refactor-rename
  // IMPORTANT: userId = user being targeted by action.
  const [_, action, user, badge] = text
    .split(" ")
    .map((chunk) => chunk.trim())
    .filter((chunk) => !!chunk);

  const userId = user ? user.slice(2, user.length - 1) : null;

  if (!action || action === ACTION_TYPES.help)
    return { action: ACTION_TYPES.help, userId, badge };
  return { action, userId, badge };
}

module.exports = {
  getIntention,
  actorIsAllowed,
};
