import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

// Execute the real migration and SQL using native SQLite; only the D1 API is mocked.
export class D1 {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec(readFileSync(new URL('../migrations/0001.sql', import.meta.url), 'utf8'));
  }

  prepare(sql) {
    const database = this;
    return {
      values: [],
      bind(...values) {
        this.values = values;
        return this;
      },
      execute() {
        const prepared = database.sqlite.prepare(sql);
        const results = prepared.columns().length ? prepared.all(...this.values) : [];
        if (!prepared.columns().length) prepared.run(...this.values);
        return { success: true, results,
          meta: { changes: database.sqlite.prepare('SELECT changes() AS n').get().n } };
      },
      async all() { return this.execute(); },
      async run() { return this.execute(); },
      async first() { return this.execute().results[0] ?? null; },
    };
  }

  async batch(statements) {
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      const results = statements.map(statement => statement.execute());
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }

  row(id) {
    return this.sqlite.prepare('SELECT * FROM posts WHERE slug = ?').get(id);
  }

  close() {
    this.sqlite.close();
  }
}
