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
  // track spending etc?
}

export interface DomainDoc {
  _id?: ObjectId;
  name: string;
  description: string;
  slackTeam: string;
}

export interface BadgeDoc {
  _id?: ObjectId;
  name: string;
  emoji: string;
  description: string;
  domains: ObjectId[];
  slackTeam: string;
}

export interface DomainRole {
  id: ObjectId;
  role: string;
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

export interface RevealIntention {
  action: ACTION_TYPES.reveal;
  targetId: string;
}

export type Intention =
  | HelpIntention
  | GrantIntention
  | RemoveIntention
  | RevealIntention;
