export enum ACTION_TYPES {
  help = "help", // show commands

  whoami = "whoami", // show self permissions and badges
  reveal = "bard", // show a user's permissions and badges

  list = "reveal", // list data of a certain type (badges | domains)

  grant = "bestow", // give badge to user
  remove = "deprive", // remove a badge from user

  promote = "promote", // promote user into paladin or admin of a domain
  demote = "demote", // remove one level of permission from a user

  forge = "forge", // create a badge for a domain
  unearth = "unearth", // create a domain

  access = "opensesame", // print password to use UI
}

// export function isActionType(string: string): string is ACTION_TYPES {
//   return string in ACTION_TYPES;
// }

export enum DB_COLLECTIONS {
  users = "users",
  badges = "badges",
  domains = "domains",
  teams = "teams",
}
