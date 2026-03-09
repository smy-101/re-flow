import Database from 'better-sqlite3';

const LIKELY_MILLISECOND_THRESHOLD = 10_000_000_000;

export interface TimestampRepairSummary {
  aiConfigs: number;
  craftTemplates: number;
  pipelines: number;
}

function normalizeExpression(column: string): string {
  return `CASE
    WHEN ${column} IS NOT NULL AND ABS(${column}) >= ${LIKELY_MILLISECOND_THRESHOLD}
      THEN CAST(${column} / 1000 AS INTEGER)
    ELSE ${column}
  END`;
}

export function fixTimestampUnits(dbPath: string = './local.db'): TimestampRepairSummary {
  const sqlite = new Database(dbPath);

  try {
    const repairTable = sqlite.transaction((table: 'ai_configs' | 'craft_templates' | 'pipelines', columns: string[]) => {
      const setClause = columns.map((column) => `${column} = ${normalizeExpression(column)}`).join(', ');
      const whereClause = columns.map((column) => `${column} IS NOT NULL AND ABS(${column}) >= ${LIKELY_MILLISECOND_THRESHOLD}`).join(' OR ');

      sqlite.prepare(`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`).run();

      return sqlite.prepare('SELECT changes() AS count').get() as { count: number };
    });

    const aiConfigs = repairTable('ai_configs', ['created_at', 'updated_at', 'last_error_at']).count;
    const craftTemplates = repairTable('craft_templates', ['created_at', 'updated_at']).count;
    const pipelines = repairTable('pipelines', ['created_at', 'updated_at']).count;

    return {
      aiConfigs,
      craftTemplates,
      pipelines,
    };
  } finally {
    sqlite.close();
  }
}

const isDirectExecution = process.argv[1]?.endsWith('fix-timestamp-units.ts');

if (isDirectExecution) {
  const summary = fixTimestampUnits();
  console.log(JSON.stringify(summary, null, 2));
}
