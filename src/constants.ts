export enum ACTION_TYPES {
  access = "access", // print password to use UI
  demote = "demote", // remove one level of permission from a user
  grant = "grant", // give badge to user
  help = "help", // show commands
  list = "list", // list data of a certain type
  promote = "promote", // promote user into paladin or admin of a domain
  remove = "remove", // remove a badge from user
  reveal = "reveal", // show a user's permissions and badges
  whoami = "whoami", // show self permissions and badges
}

export function isActionType(string: string): string is ACTION_TYPES {
  return string in ACTION_TYPES;
}
