import { IGameRepository } from "./repository";
import { FileGameRepository } from "./file-repository";
import { SupabaseGameRepository } from "./supabase";

let repositoryInstance: IGameRepository | null = null;

export function getGameRepository(): IGameRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith("http")) {
    try {
      repositoryInstance = new SupabaseGameRepository(supabaseUrl, supabaseKey);
      return repositoryInstance;
    } catch (e) {
      console.warn("Falha ao inicializar Supabase, usando repositório local em arquivo:", e);
    }
  }

  repositoryInstance = new FileGameRepository();
  return repositoryInstance;
}
