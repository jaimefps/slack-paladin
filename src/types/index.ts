import { Context as SlackContext, SlackEvent } from "@slack/bolt";
import { Db, ObjectId } from "mongodb";
import { ACTION_TYPES } from "../constants";

/**
 * Global Data Interface
 *
 */
export interface CascadingRoot {
  context: SlackContext;
  dbSingleton: Db;
  event: SlackEvent;
}

export interface CascadingData extends CascadingRoot {
  actor: UserDoc;
  team: TeamDoc;
}

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
  description?: string;
  domain: ObjectId;
  slackTeam: string;
}

export enum UserRole {
  admin = "admin",
  paladin = "paladin",
}

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
  badgeName: string;
  domain: string;
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

export enum Listings {
  badges = "badges",
  domains = "domains",
}

// reveal badges|domains
export interface ListIntention {
  action: ACTION_TYPES.list;
  resource: Listings;
}

export interface PromoteIntention {
  action: ACTION_TYPES.promote;
  targetId: string;
  domain: string;
}

export interface DemoteIntention {
  action: ACTION_TYPES.demote;
  targetId: string;
  domain: string;
}

export interface ForgeIntention {
  action: ACTION_TYPES.forge;
  domain: string;
  badge: string;
  name: string;
}

export type Intention =
  | GrantIntention
  | HelpIntention
  | ListIntention
  | RemoveIntention
  | RevealIntention
  | UnearthIntention
  | WhoamiIntention
  | PromoteIntention
  | DemoteIntention
  | ForgeIntention;
