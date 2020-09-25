import {
  BadgeDoc,
  CascadingData,
  DomainDoc,
  DomainRole,
  RevealIntention,
  UserDoc,
} from "../../types";
import { DB_COLLECTIONS } from "../../constants";
import { findOrCreateUser } from "../../database/user-facade";
import { areSameId } from "../../database/utils";

export async function handleReveal(
  { dbSingleton, event: { team } }: CascadingData,
  { targetId }: RevealIntention
): Promise<string> {
  let userDoc: UserDoc;
  let badgeDocs: BadgeDoc[];
  let domainDocs: DomainDoc[];
  let roleDomains: DomainDoc[];

  try {
    // get user data:
    userDoc = await findOrCreateUser({
      dbSingleton,
      user: targetId,
      team,
    });
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to find or register: <@${targetId}>`);
  }

  if (userDoc.badges.length < 1) {
    return `<@${targetId}> doesn't have any badges... yet!`;
  }

  try {
    // find badges by ids:
    badgeDocs = await dbSingleton
      .collection(DB_COLLECTIONS.badges)
      .find({ _id: { $in: userDoc.badges } })
      .toArray();
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to lookup badges for: <@${targetId}>`);
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
            $in: userDoc.domains.map((domainRole) => domainRole.id),
          },
        })
        .toArray(),
    ]);
  } catch (e) {
    console.error(e);
    throw new Error(`Paladin failed to lookup domains.`);
  }

  const badgesByDomain: [DomainDoc, BadgeDoc[]][] = [];

  domainDocs.forEach((domain) => {
    badgesByDomain.push([
      domain,
      badgeDocs.filter((badge) => areSameId(domain._id, badge.domain)),
    ]);
  });

  let userDetails = `The bard sings the tale of <@${userDoc.slackUser}> and their adventures throughout the kingdom.`;
  userDetails = `${userDetails}\nThey’ve garnered a total of ${userDoc.badges.length} badges from ${domainDocs.length} domains.`;

  badgesByDomain.forEach(([domain, badges]) => {
    userDetails = `${userDetails}\n\n\`Domain: ${domain.name}\`\n`;

    badges.forEach(({ emoji, name }) => {
      userDetails = `${userDetails}\n ${emoji} ${name}`;
    });
  });

  if (userDoc.domains.length > 0) {
    userDetails = `${userDetails}\n\n\`And is a higher member of the following courts\`\n`;

    roleDomains.forEach((domain) => {
      const cb = (dr: DomainRole) => areSameId(dr.id, domain._id);
      const thisLvl = userDoc.domains.find(cb).role;
      userDetails = `${userDetails}\n${domain.name}: ${thisLvl}`;
    });
  }

  return userDetails;
}
