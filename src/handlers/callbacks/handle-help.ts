import { ACTION_TYPES } from "../../constants";

export async function handleHelp() {
  return `These are the commands I support:
\`\`\`
@paladin ${ACTION_TYPES.help}
  => shows list commands

@paladin ${ACTION_TYPES.whoami}
  => shows own permissions and badges
  
@paladin ${ACTION_TYPES.reveal} <user>
  => shows a user's permissions and badges

@paladin ${ACTION_TYPES.list} badges
  => shows list available badges

@paladin ${ACTION_TYPES.list} domains
  => shows list domains and their admin/paladins

@paladin ${ACTION_TYPES.grant} <user> <badge>
  => gives badge to the user

@paladin ${ACTION_TYPES.remove} <user> <badge>
  => removes badge from the user

@paladin ${ACTION_TYPES.promote} <user> <domain>
  => promotes user to next level up in selected domain

@paladin ${ACTION_TYPES.demote} <user> <domain>
  => converts user to "villager" in domain

@paladin ${ACTION_TYPES.forge} <badge> <domain>
  => converts user to "villager" in domain

@paladin ${ACTION_TYPES.unearth} <domain>
  => creates a 

@paladin ${ACTION_TYPES.access}
  => respond with password for UI dashboard
\`\`\`
  `;
}
