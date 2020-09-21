export enum ACTION_TYPES {
  help = "help", // list commands
  listBadges = "listBadges", // list available badges data
  listDomains = "listDomains", // list domains and their admin/paladins
  whoami = "whoami", // show self permissions and badges
  reveal = "reveal", // show a user's permissions and badges
  grant = "grant", // give badge to user
  remove = "remove", // remove a badge from user
  exile = "exile", // convert user into villager
  promote = "promote", // promote user into paladin or admin of a domain
}
