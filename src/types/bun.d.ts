declare module "bun:sqlite" {
  export class Statement {
    get(...params: any[]): any;
    all(...params: any[]): any[];
    run(...params: any[]): any;
  }

  export class Database {
    constructor(filename?: string, options?: any);
    run(sql: string, ...params: any[]): any;
    prepare(sql: string): Statement;
    query(sql: string): Statement;
    close(): void;
  }
}
