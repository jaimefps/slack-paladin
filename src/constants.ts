export const SLACK_EVENTS = {
  app_mention: "app_mention",
};

export const ACTION_TYPES = {
  help: "help", // list commands
  listBadges: "list-badges", // list available badges data
  listDomains: "list-domains", // list domains and their admin/paladins
  whoami: "whoami", // show self permissions and badges
  reveal: "reveal", // show a user's permissions and badges
  grant: "grant", // give badge to user
  remove: "remove", // remove a badge from user
  exile: "exile", // convert user into villager
  promote: "promote", // promote user into paladin or admin of a domain
};

export const ROLE_TYPES = {
  admin: [Object.values(ACTION_TYPES)],
  paladin: [
    Object.values(ACTION_TYPES).filter(
      (perm) => perm !== "exile" && perm !== "promote"
    ),
  ],
  villager: [
    ACTION_TYPES.help,
    ACTION_TYPES.reveal,
    ACTION_TYPES.listBadges,
    ACTION_TYPES.listDomains,
  ],
};
