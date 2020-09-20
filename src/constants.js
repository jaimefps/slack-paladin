const SLACK_EVENTS = {
  app_mention: "app_mention",
};

const ACTION_TYPES = {
  exile: "exile", // convert user into villager
  grant: "grant", // give badge to user
  help: "help", // list commands
  listBadges: "list-badges", // list available badges data
  listDomains: "list-domains", // list domains and their admin/paladins
  remove: "remove", // remove a badge from user
  reveal: "reveal", // show a user's permissions and badges
  whoami: "whoami", // show self permissions and badges
};

const ROLE_TYPES = {
  admin: [Object.values(ACTION_TYPES)],
  paladin: [
    Object.values(ACTION_TYPES).filter(
      (perm) => perm !== "exiled" || perm !== "promote"
    ),
  ],
  villager: [
    ACTION_TYPES.help,
    ACTION_TYPES.reveal,
    ACTION_TYPES.listBadges,
    ACTION_TYPES.listDomains,
  ],
};

module.exports = {
  ACTION_TYPES,
  ROLE_TYPES,
  SLACK_EVENTS,
};
