import { StorylineDefinition } from "./types";
import { valoriaClassicStoryline } from "./valoria-classic";
import { kharInvasionStoryline } from "./khar-invasion";
import { darkPlagueStoryline } from "./dark-plague";

export * from "./types";

export const STORYLINES: StorylineDefinition[] = [
  valoriaClassicStoryline,
  kharInvasionStoryline,
  darkPlagueStoryline,
];

export const DEFAULT_STORYLINE_ID = "valoria_classic";

export function getStoryline(id?: string): StorylineDefinition {
  if (!id) return valoriaClassicStoryline;
  const found = STORYLINES.find((s) => s.id === id);
  return found || valoriaClassicStoryline;
}
