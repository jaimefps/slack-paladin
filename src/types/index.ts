export interface Intention {
  action: string;
  userId: string;
  badge: string;
}

export interface ActorDoc {
  badges: String[];
  domains: { name: string; role: string }[];
}

export interface BadgeDoc {
  points: Number;
  domains: String[];
}

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
