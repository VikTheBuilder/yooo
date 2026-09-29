// Type declarations for node:sqlite (Node.js 22 experimental built-in)
declare module 'node:sqlite' {
  interface StatementResultingChanges {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  type SupportedValueType = null | number | bigint | string | Uint8Array;

  class StatementSync {
    get(...params: SupportedValueType[]): Record<string, SupportedValueType> | undefined;
    all(...params: SupportedValueType[]): Record<string, SupportedValueType>[];
    run(...params: SupportedValueType[]): StatementResultingChanges;
    iterate(...params: SupportedValueType[]): IterableIterator<Record<string, SupportedValueType>>;
    expandedSQL: string;
    sourceSQL: string;
    setAllowBareNamedParameters(enabled: boolean): void;
    setReadBigInts(enabled: boolean): void;
  }

  class DatabaseSync {
    constructor(location: string, options?: { open?: boolean });
    open(): void;
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    loadExtension(path: string, entryPoint?: string): void;
  }
}
