import { ACTION_TYPES } from "../../constants";

export async function handleHelp() {
  return `These are the commands I support:
\`\`\`
@paladin ${ACTION_TYPES.help}
  => shows list commands

@paladin ${ACTION_TYPES.whoami}
  => shows own permissions and badges
  
@paladin ${ACTION_TYPES.reveal} <user_mention>
  => shows a user's permissions and badges

@paladin ${ACTION_TYPES.list} badges
  => shows list available badges

@paladin ${ACTION_TYPES.list} domains
  => shows list domains and their admin/paladins

@paladin ${ACTION_TYPES.unearth} <domain_name>
  => creates a domain with the provided name

@paladin ${ACTION_TYPES.forge} <badge_name> <badge_emoji> <domain_name>
  => converts user to "villager" in domain

@paladin ${ACTION_TYPES.grant} <user_mention> <badge_emoji:>
  => gives badge to the user

@paladin ${ACTION_TYPES.remove} <user_mention> <badge>
  => removes badge from the user

@paladin ${ACTION_TYPES.promote} <user_mention> <domain>
  => promotes user to next level up in selected domain

@paladin ${ACTION_TYPES.demote} <user_mention> <domain>
  => converts user to "villager" in domain
\`\`\`
  `;
}

//@paladin ${ACTION_TYPES.access}
//  => respond with password for UI dashboard
