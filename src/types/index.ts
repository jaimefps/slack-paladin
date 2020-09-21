export interface Intention {
  action: string;
  userId: string;
  badge: string;
}

/**
 * DATABASE Doc interfaces
 */
export interface DomainRoles {
  name: String;
  role: String;
}

export interface TeamDoc {
  id: String;
  slackTeam: String;
  // track spending etc?
}

export interface DomainDoc {
  id: string;
  name: String;
  slackTeam: String;
}

export interface BadgeDoc {
  id?: String;
  emoji?: String;
  points?: Number;
  domains: String[]; // DomainDoc.id
  slackTeam?: String;
}

export interface ActorDoc {
  id?: String;
  badges: String[];
  domains: DomainRoles[];
  slackTeam?: String;
  slackUser?: String;
}

/**
 * TODO delete below interfaces
 */
export interface CascadingData {
  context: any;
  event: any;
  intention?: Intention;
  actor?: ActorDoc;
}
export interface DomainCollection {
  [k: string]: string;
}
export interface BadgeCollection {
  [k: string]: BadgeDoc;
}
export interface UserCollection {
  [k: string]: ActorDoc;
}
