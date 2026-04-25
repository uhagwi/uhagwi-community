/**
 * 마이그레이션 적용 후 테이블·시드 데이터 검증
 */
import pg from 'pg';

const url = process.env.PG_URL;
if (!url) { console.error('PG_URL 필요'); process.exit(1); }

const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();

const queries = [
  ["테이블 목록", `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`],
  ["users 행 수", `SELECT count(*) FROM users`],
  ["harnesses 행 수", `SELECT count(*) FROM harnesses`],
  ["posts 행 수", `SELECT count(*) FROM posts`],
  ["comments 행 수", `SELECT count(*) FROM comments`],
  ["reactions 행 수", `SELECT count(*) FROM reactions`],
  ["tags 행 수", `SELECT count(*) FROM tags`],
];

for (const [label, sql] of queries) {
  try {
    const r = await c.query(sql);
    if (label === '테이블 목록') {
      console.log(`▸ ${label}: ${r.rows.map(x => x.tablename).join(', ')}`);
    } else {
      console.log(`▸ ${label}: ${r.rows[0].count}`);
    }
  } catch (e) {
    console.log(`▸ ${label}: ❌ ${e.message}`);
  }
}

await c.end();
