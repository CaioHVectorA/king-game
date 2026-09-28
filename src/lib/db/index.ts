import { IGameRepository } from "./repository";
import { SQLiteGameRepository } from "./sqlite-repository";
import { FileGameRepository } from "./file-repository";

let repositoryInstance: IGameRepository | null = null;

export function getGameRepository(): IGameRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  try {
    repositoryInstance = new SQLiteGameRepository();
    return repositoryInstance;
  } catch {
    // Em ambientes Node (ex: next build estático), usa FileGameRepository
    repositoryInstance = new FileGameRepository();
    return repositoryInstance;
  }
}
