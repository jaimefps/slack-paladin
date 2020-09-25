import { BadgeDoc, CascadingData, DomainDoc, DomainRole } from "../../types";
import { DB_COLLECTIONS } from "../../constants";
import { areSameId } from "../../database/utils";

export async function handleWhoami({
  dbSingleton,
  actor,
}: CascadingData): Promise<string> {
  let badgeDocs: BadgeDoc[];
  let domainDocs: DomainDoc[];
  let roleDomains: DomainDoc[];

  if (actor.badges.length < 1) {
    return `You don't have any stories to tell ... yet!`;
  }

  try {
    badgeDocs = await dbSingleton
      .collection(DB_COLLECTIONS.badges)
      .find({ _id: { $in: actor.badges } })
      .toArray();
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to lookup your badges.`);
  }

  try {
    [domainDocs, roleDomains] = await Promise.all([
      dbSingleton
        .collection(DB_COLLECTIONS.domains)
        .find({
          _id: {
            $in: badgeDocs.map((badge) => badge.domain),
          },
        })
        .toArray(),

      dbSingleton
        .collection(DB_COLLECTIONS.domains)
        .find({
          _id: {
            $in: actor.domains.map((domainRole) => domainRole.id),
          },
        })
        .toArray(),
    ]);
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to lookup your domains.`);
  }

  const badgesByDomain: [DomainDoc, BadgeDoc[]][] = [];

  domainDocs.forEach((domain) => {
    badgesByDomain.push([
      domain,
      badgeDocs.filter((badge) => areSameId(domain._id, badge.domain)),
    ]);
  });

  let userDetails = `The bard sings the tale of <@${actor.slackUser}> and their adventures throughout the kingdom.`;
  userDetails = `${userDetails}\nThey’ve garnered a total of ${actor.badges.length} badges from ${domainDocs.length} domains.`;

  badgesByDomain.forEach(([domain, badges]) => {
    userDetails = `${userDetails}\n\n\`Domain: ${domain.name}\`\n`;

    badges.forEach(({ emoji, name }) => {
      userDetails = `${userDetails}\n ${emoji} ${name}`;
    });
  });

  if (actor.domains.length > 0) {
    userDetails = `${userDetails}\n\n\`And is a higher member of the following courts\`\n`;

    roleDomains.forEach((domain) => {
      const cb = (dr: DomainRole) => areSameId(dr.id, domain._id);
      const thisLvl = actor.domains.find(cb).role;
      userDetails = `${userDetails}\n${domain.name}: ${thisLvl}`;
    });
  }

  return userDetails;
}
