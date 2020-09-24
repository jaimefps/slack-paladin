import { CascadingData, Intention } from "../../types";

export async function teamIsAllowed(_: CascadingData, __: Intention) {
  return true;
}
