import { ACTION_TYPES } from "../../constants";
import { CascadingData, Intention } from "../../types";

export function createHelpIntention(): Intention {
  return {
    action: ACTION_TYPES.help,
  };
}

export function getTextParts({ event: { text } }: CascadingData): string[] {
  return text
    .split(" ")
    .map((chunk: string) => chunk.trim())
    .filter((chunk: string) => !!chunk);
}

export function getAction(data: CascadingData) {
  return getTextParts(data)[1] as ACTION_TYPES;
}

export function getIntention(data: CascadingData): Intention {
  // IMPORTANT: badge = badge|domain. // TODO refactor-rename
  // IMPORTANT: userId = user being targeted by action.
  // const [, action, user, badge] = text
  //   .split(" ")
  //   .map((chunk: string) => chunk.trim())
  //   .filter((chunk: string) => !!chunk);

  // return !action
  //   ? {
  //       action: ACTION_TYPES.help,
  //       userId: null,
  //       badge: null,
  //     }
  //   : {
  //       action,
  //       userId: user ? user.slice(2, user.length - 1) : null,
  //       badge,
  //     };

  const action = getAction(data);

  switch (action) {
    case ACTION_TYPES.help:
      return createHelpIntention();
    default:
      throw new Error(`Paladin server failed to determine actor intention.`);
  }
}
