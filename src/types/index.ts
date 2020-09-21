import { Context as SlackContext, SlackEvent } from "@slack/bolt";
import { Db } from "mongodb";
import { ACTION_TYPES } from "../constants";

export interface Intention {
  action: ACTION_TYPES;
  targetId?: string;
  badge?: string;
}

/**
 * DATABASE Doc interfaces
 */
export interface DomainRoles {
  name: string;
  role: string;
}

export interface TeamDoc {
  _id: string;
  slackTeam: string;
  // track spending etc?
}

export interface DomainDoc {
  _id: string;
  name: string;
  slackTeam: string;
}

export interface BadgeDoc {
  _id?: string;
  name?: string;
  emoji?: string;
  description?: string;
  points?: Number;
  domains: string[]; // DomainDoc.id
  slackTeam?: string;
}

export interface ActorDoc {
  _id?: string;
  badges: string[];
  domains: DomainRoles[];
  slackTeam?: string;
  slackUser: string;
}

/**
 * TODO delete below interfaces
 */
export interface CascadingData {
  actor?: ActorDoc;
  context: SlackContext;
  dbSingleton?: Db;
  event: SlackEvent;
  intention?: Intention;
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
