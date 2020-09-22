import { Context as SlackContext, SlackEvent } from "@slack/bolt";
import { Db, ObjectId } from "mongodb";
import { ACTION_TYPES } from "../constants";

/**
 * Database Interfaces
 *
 */
export interface TeamDoc {
  _id?: ObjectId;
  slackTeam: string;
  // etc
}

export interface DomainDoc {
  _id?: ObjectId;
  name: string;
  slackTeam: string;
  description?: string;
}

export interface BadgeDoc {
  _id?: ObjectId;
  name: string;
  emoji: string;
  description: string;
  domain: ObjectId;
  slackTeam: string;
}

export type UserRole = "admin" | "paladin";

export interface DomainRole {
  id: ObjectId;
  role: UserRole;
}

export interface UserDoc {
  _id?: ObjectId;
  badges: ObjectId[];
  domains: DomainRole[];
  slackTeam: string;
  slackUser: string;
}

/**
 * Global Data Interface
 *
 */
export interface CascadingData {
  actor: UserDoc;
  context: SlackContext;
  dbSingleton: Db;
  event: SlackEvent;
}

/**
 * Intention Interfaces
 *
 */
export interface HelpIntention {
  action: ACTION_TYPES.help;
}

export interface UnearthIntention {
  action: ACTION_TYPES.unearth;
  domain: string;
}

export interface BadgeIntention {
  targetId: string;
  badge: string;
}

export interface GrantIntention extends BadgeIntention {
  action: ACTION_TYPES.grant;
}

export interface RemoveIntention extends BadgeIntention {
  action: ACTION_TYPES.remove;
}

// bard action
export interface RevealIntention {
  action: ACTION_TYPES.reveal;
  targetId: string;
}

export interface WhoamiIntention {
  action: ACTION_TYPES.whoami;
}

export type Intention =
  | HelpIntention
  | GrantIntention
  | RemoveIntention
  | RevealIntention
  | UnearthIntention
  | WhoamiIntention;
