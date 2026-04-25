/**
 * 우하귀 Supabase 마이그레이션 일괄 적용 스크립트
 *
 * 사용:
 *   PG_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres" \
 *   APPLY_SEED=1 \
 *   node scripts/apply-migrations.mjs
 *
 * 동작:
 *   1) supabase/migrations/*.sql 을 파일명 정렬로 순차 실행
 *   2) APPLY_SEED=1 이면 supabase/seed.sql 도 마지막에 실행
 *   3) 각 파일을 단일 트랜잭션으로 실행 (실패 시 해당 파일만 롤백)
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', 'supabase');
const MIG_DIR = join(ROOT, 'migrations');
const SEED = join(ROOT, 'seed.sql');

const url = process.env.PG_URL;
if (!url) {
  console.error('❌ 환경변수 PG_URL 필요');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function runFile(label, path) {
  const sql = await readFile(path, 'utf8');
  process.stdout.write(`▸ ${label} ... `);
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅');
    return true;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.log(`❌\n  ${err.message}`);
    return false;
  }
}

const main = async () => {
  await client.connect();
  console.log(`연결: ${url.split('@')[1]?.split('/')[0] ?? '?'}`);

  const files = (await readdir(MIG_DIR)).filter((f) => f.endsWith('.sql')).sort();
  let okCount = 0;
  for (const f of files) {
    const ok = await runFile(`migrations/${f}`, join(MIG_DIR, f));
    if (ok) okCount += 1;
    else break;
  }

  if (okCount === files.length && process.env.APPLY_SEED === '1') {
    await runFile('seed.sql', SEED);
  }

  await client.end();
  console.log(`\n총 ${okCount}/${files.length} 마이그레이션 적용`);
  process.exit(okCount === files.length ? 0 : 1);
};

main().catch((err) => {
  console.error('fatal:', err);
  process.exit(1);
});
