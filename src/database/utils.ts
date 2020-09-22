import { ObjectId } from "mongodb";

export function areSameId(a: ObjectId, b: ObjectId): boolean {
  return a.equals(b);
}
