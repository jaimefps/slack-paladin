export async function handleHelp() {
  return `These are the commands I support:
\`\`\`
@paladin help
  => shows list commands

@paladin whoami
  => shows own permissions and badges
  
@paladin bard <user>
  => shows a user's permissions and badges

@paladin reveal badges
  => shows list available badges

@paladin reveal domains
  => shows list domains and their admin/paladins

@paladin bestow <user> <badge>
  => gives badge to the user

@paladin deprive <user> <badge>
  => removes badge from the user

@paladin promote <user> <domain>
  => promotes user to next level up in selected domain

@paladin demote <user> <domain>
  => converts user to "villager" in domain

@paladin forge <badge> <domain>
  => converts user to "villager" in domain

@paladin opensesame
  => respond with password for UI dashboard
\`\`\`
  `;
}
