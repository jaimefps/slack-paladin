/**
 * run observability and logging from this function
 *
 */
export function fatal(e: Error): never {
  console.error(e);
  throw new Error(`Paladin failed to complete operation: ${e.message || e}`);
}

export function isValidUser(user: string): boolean {
  return user.match(/[A-Za-z0-9_]{11}/) !== null;
}
