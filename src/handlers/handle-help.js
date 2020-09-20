async function handleHelp() {
  return `These are the invocations I support:
\`\`\`
@paladin help
  => shows list commands

@paladin whoami
  => shows self permissions and badges

@paladin list-badges
  => shows list available badges

@paladin list-domains
  => shows list domains and their admin/paladins
  
@paladin reveal <user>
  => shows a user's permissions and badges

@paladin grant <user> <badge>
  => gives badge to the user

@paladin remove <user> <badge>
  => removes badge from the user

@paladin promote <user> <domain>
  => promotes user to next level up in selected domain

@paladin exile <user> <domain>
  => converts user to "villager" in domain
\`\`\`
  `;
}

module.exports = {
  handleHelp,
};
