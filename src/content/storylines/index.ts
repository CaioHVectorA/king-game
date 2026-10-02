import { StorylineDefinition } from "./types";
import { valoriaClassicStoryline } from "./valoria-classic";
import { kharInvasionStoryline } from "./khar-invasion";
import { darkPlagueStoryline } from "./dark-plague";
import { colonyExodusStoryline } from "./colony-exodus";
import { zombieApocalypseStoryline } from "./zombie-apocalypse";
import { rioZombieStoryline } from "./rio-zombie";
import { republicaDeSangueStoryline } from "./republica-sangue";
import { arcaniaTronoStoryline } from "./arcania-trono";

export * from "./types";

export const STORYLINES: StorylineDefinition[] = [
  valoriaClassicStoryline,
  kharInvasionStoryline,
  darkPlagueStoryline,
  republicaDeSangueStoryline,
  arcaniaTronoStoryline,
  colonyExodusStoryline,
  zombieApocalypseStoryline,
  rioZombieStoryline,
];

export const DEFAULT_STORYLINE_ID = "valoria_classic";

export function getStoryline(id?: string): StorylineDefinition {
  if (!id) return valoriaClassicStoryline;
  const found = STORYLINES.find((s) => s.id === id);
  return found || valoriaClassicStoryline;
}
