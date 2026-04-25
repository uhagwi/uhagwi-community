'use client';

/**
 * 하네스 폴더 업로드 — 드래그 앤 드롭 + 폴더 선택 (webkitdirectory).
 *
 * 클라이언트 사이드에서 CLAUDE.md / .claude/agents / .claude/skills 를 파싱해
 * 폼에 자동 채움. 서버 업로드 없음 (개인정보 노출 위험 0).
 */
import { useRef, useState } from 'react';

export type ParsedHarness = {
  title?: string;
  one_liner?: string;
  persona_name?: string;
  purpose?: string;
  body_md?: string;
  components?: string[];
  tags?: string[];
  category?: 'verify' | 'improve' | 'proposal' | 'develop' | 'other';
};

interface Props {
  onParsed: (data: ParsedHarness) => void;
}

type FileLike = { path: string; file: File };

export function HarnessFolderUpload({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    folder: string;
    files: number;
    agents: number;
    skills: number;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFiles(files: FileLike[]) {
    if (files.length === 0) return;
    setError(null);
    setParsing(true);
    try {
      const data = await parseHarnessFolder(files);
      const folder = files[0]?.path.split('/')[0] ?? 'unknown';
      setStats({
        folder,
        files: files.length,
        agents: data.components?.filter((c) => c.startsWith('agent:')).length ?? 0,
        skills: data.components?.filter((c) => c.startsWith('skill:')).length ?? 0,
      });
      onParsed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '파싱 실패');
    } finally {
      setParsing(false);
    }
  }

  async function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const files: FileLike[] = Array.from(list).map((f) => ({
      path: (f as File & { webkitRelativePath?: string }).webkitRelativePath ?? f.name,
      file: f,
    }));
    await handleFiles(files);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const files = await collectFromDataTransfer(e.dataTransfer);
    await handleFiles(files);
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openPicker();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed px-6 py-8 text-center transition ${
          dragOver
            ? 'border-brand-500 bg-brand-50'
            : 'border-brand-200 bg-cream-50 hover:border-brand-400 hover:bg-brand-50/50'
        } ${parsing ? 'opacity-60 pointer-events-none' : ''}`}
        aria-label="하네스 폴더 업로드 영역"
      >
        <span className="text-3xl" aria-hidden>📂</span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-brand-800">
            하네스 폴더를 끌어다 놓거나 클릭하세요
          </p>
          <p className="text-xs text-[color:var(--color-ink-600)]">
            CLAUDE.md · README.md · .claude/agents · .claude/skills 자동 분석
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          // @ts-expect-error — webkitdirectory 는 React 표준 prop이 아니지만 브라우저 지원
          webkitdirectory=""
          directory=""
          multiple
          onChange={onInputChange}
          className="hidden"
          aria-hidden
        />
      </div>

      {parsing ? (
        <p className="text-xs text-brand-700" role="status">
          분석 중…
        </p>
      ) : null}

      {stats ? (
        <div className="rounded-[10px] bg-mint-400/20 px-3 py-2 text-xs text-brand-800">
          ✅ <strong>{stats.folder}</strong> 분석 완료 — 파일 {stats.files}개 · 에이전트{' '}
          {stats.agents}개 · 스킬 {stats.skills}개. 아래 폼에서 검토 후 게시하세요.
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs text-[color:var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 파싱 로직
// ---------------------------------------------------------------------------

async function parseHarnessFolder(files: FileLike[]): Promise<ParsedHarness> {
  // 루트(최단 경로)의 CLAUDE.md / README.md 우선 — 하위 폴더 README 노이즈 방지
  const claudeMd = findShallowest(files, 'CLAUDE.md');
  const readme = findShallowest(files, 'README.md');

  const claudeContent = claudeMd ? await claudeMd.file.text() : '';
  const readmeContent = readme ? await readme.file.text() : '';

  const agentNames = files
    .filter((f) => /\.claude\/agents\/[^/]+\.md$/i.test(f.path))
    .map((f) => {
      const name = f.path.split('/').pop()?.replace(/\.md$/i, '') ?? '';
      return `agent:${name}`;
    })
    .filter((c) => c !== 'agent:');

  const skillNames = new Set<string>();
  for (const f of files) {
    const m = f.path.match(/\.claude\/skills\/([^/]+)/i);
    if (m && m[1]) skillNames.add(`skill:${m[1]}`);
  }

  const title = extractH1(claudeContent) ?? deriveTitleFromPath(files[0]?.path);
  const oneLiner = extractOneLiner(claudeContent);
  const purpose = extractPurpose(claudeContent) ?? oneLiner ?? '';
  const personaName = extractPersona(claudeContent);
  const category = inferCategory(`${title ?? ''} ${oneLiner ?? ''} ${purpose}`);
  const tags = extractTags(claudeContent);

  // 본문: 루트 README 가 메인. 없으면 CLAUDE.md 본체. boilerplate 라인 제거.
  const bodySource = readmeContent || claudeContent;
  const body_md = stripBoilerplate(bodySource).slice(0, 20000);

  return {
    title: title?.slice(0, 120),
    one_liner: oneLiner?.slice(0, 200),
    purpose: purpose?.slice(0, 2000),
    body_md,
    persona_name: personaName?.slice(0, 40),
    components: [...agentNames, ...skillNames].slice(0, 20),
    tags,
    category,
  };
}

/** 같은 파일명이 여러 군데 있으면 가장 얕은 (루트에 가까운) 파일 반환 */
function findShallowest(files: FileLike[], filename: string): FileLike | undefined {
  const target = filename.toLowerCase();
  const matches = files.filter((f) => {
    const last = f.path.split('/').pop()?.toLowerCase() ?? '';
    return last === target;
  });
  matches.sort((a, b) => a.path.split('/').length - b.path.split('/').length);
  return matches[0];
}

/** "CRITICAL RULE: ... 한국어로 ..." 같은 운영 보일러플레이트 라인 식별 */
function isBoilerplate(line: string): boolean {
  const t = line.replace(/[*_>`]/g, '').trim();
  if (!t) return true;
  if (/CRITICAL\s+RULE/i.test(t)) return true;
  if (/모든\s+응답.*한국어/.test(t)) return true;
  if (/IMPORTANT[:：]/i.test(t) && t.length < 80) return true;
  return false;
}

/** boilerplate 라인 제거하고 본문만 반환 */
function stripBoilerplate(md: string): string {
  return md
    .split('\n')
    .filter((line) => !isBoilerplate(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

function extractH1(md: string): string | undefined {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  return m?.[1]?.replace(/[#*_`]/g, '').trim();
}

/** 한줄요약 — boilerplate 제외, 의미있는 슬로건/blockquote/첫 문단 우선 */
function extractOneLiner(md: string): string | undefined {
  // 1. 모든 blockquote 중 boilerplate 가 아닌 첫 줄
  const blockquotes = md.match(/^>\s*(.+?)$/gm);
  if (blockquotes) {
    for (const bq of blockquotes) {
      const text = bq.replace(/^>\s*/, '').replace(/[*_`]/g, '').trim();
      if (!isBoilerplate(text) && text.length > 5) return text;
    }
  }
  // 2. "한 줄 정의 / 슬로건 / 한줄 소개" 섹션
  const def = extractSection(md, ['한 줄 정의', '한줄 소개', '슬로건', '소개', '한 줄 소개']);
  if (def) {
    const firstLine = def.split('\n').map((l) => l.trim()).find((l) => l && !isBoilerplate(l));
    if (firstLine) return firstLine.replace(/[*_`]/g, '');
  }
  // 3. 첫 일반 단락
  const cleaned = md
    .replace(/^---[\s\S]*?---/m, '')
    .split(/\n\n+/)
    .map((s) => s.trim())
    .find(
      (p) =>
        p &&
        !p.startsWith('#') &&
        !p.startsWith('>') &&
        !p.startsWith('|') &&
        !p.startsWith('-') &&
        !isBoilerplate(p) &&
        p.length > 10,
    );
  return cleaned?.split('\n')[0]?.replace(/[*_`]/g, '');
}

/** 목적 — 명시적 ## 목적/역할/소개 섹션 우선, boilerplate 제거 */
function extractPurpose(md: string): string | undefined {
  const headings = ['목적', '역할', '소개', '개요', '한 줄 정의'];
  for (const h of headings) {
    const re = new RegExp(`^##\\s+${h}\\s*\\n+([\\s\\S]+?)(?=\\n##\\s|\\n---|\\n#\\s|$)`, 'm');
    const m = md.match(re);
    if (m?.[1]) {
      const cleaned = stripBoilerplate(m[1]).trim();
      if (cleaned) return cleaned;
    }
  }
  return undefined;
}

function extractSection(md: string, headings: string[]): string | undefined {
  for (const h of headings) {
    const re = new RegExp(`^##\\s+${h}\\s*\\n+([\\s\\S]+?)(?=\\n##\\s|\\n---|\\n#\\s|$)`, 'm');
    const m = md.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return undefined;
}

function extractPersona(md: string): string | undefined {
  const m =
    md.match(/페르소나[^\n]*?[":：]\s*([^\n,，]{1,30})/) ??
    md.match(/persona[^\n]*?[":：]\s*([^\n,，]{1,30})/i) ??
    md.match(/의인화[^\n]*?[":：]\s*([^\n,，]{1,30})/);
  return m?.[1]?.trim().replace(/[#*_`"']/g, '');
}

function inferCategory(text: string): ParsedHarness['category'] {
  const t = text.toLowerCase();
  // 우선순위: 명확한 도메인 키워드를 먼저 매치
  if (/제안서|proposal|기획서|공모|입찰|rfp/.test(t)) return 'proposal';
  if (/검증|verify|validator|fact[- ]?check|보안 ?감사/.test(t)) return 'verify';
  if (/개선|refine|polish|문서 ?다듬|퇴고/.test(t)) return 'improve';
  if (/개발|scaffold|풀스택|fullstack|배포|deploy|api 만|앱 만|service-dev/.test(t)) return 'develop';
  return 'other';
}

function extractTags(md: string): string[] {
  const tags = new Set<string>();
  // YAML frontmatter tags: [a, b, c]
  const fm = md.match(/^tags:\s*\[(.+?)\]/m);
  if (fm?.[1]) {
    fm[1].split(',').forEach((t) => {
      const cleaned = t.trim().replace(/['"]/g, '');
      if (isValidTag(cleaned)) tags.add(cleaned);
    });
  }
  // 해시태그 — 단어 경계 (공백·괄호) 뒤 #키워드, 첫 글자는 한글/영문 강제 (숫자만 / hex 컬러 차단)
  const hashRe = /(?:^|[\s(])#([가-힣A-Za-z_][가-힣A-Za-z0-9_]{1,19})/g;
  let m: RegExpExecArray | null;
  while ((m = hashRe.exec(md)) !== null) {
    if (m[1] && isValidTag(m[1])) tags.add(m[1]);
    if (tags.size >= 8) break;
  }
  return Array.from(tags).slice(0, 8);
}

function isValidTag(t: string): boolean {
  if (!t || t.length < 2 || t.length > 20) return false;
  if (/^[0-9]+$/.test(t)) return false;       // 순수 숫자 (#18, #94)
  if (/^[A-Fa-f0-9]{6}$/.test(t)) return false; // hex 컬러 코드 (#4A2E4E)
  if (/^[A-Fa-f0-9]{3}$/.test(t) && /[A-Fa-f]/.test(t)) return false; // 3자리 hex
  return true;
}

function deriveTitleFromPath(path: string | undefined): string | undefined {
  if (!path) return undefined;
  const folder = path.split('/')[0];
  return folder?.replace(/[_-]+/g, ' ');
}

// ---------------------------------------------------------------------------
// DataTransfer → FileLike[] (드래그 앤 드롭 시 폴더 재귀 탐색)
// ---------------------------------------------------------------------------

async function collectFromDataTransfer(dt: DataTransfer): Promise<FileLike[]> {
  const items = Array.from(dt.items);
  const out: FileLike[] = [];
  await Promise.all(
    items.map(async (it) => {
      const entry = it.webkitGetAsEntry?.();
      if (entry) await walkEntry(entry, '', out);
      else {
        const f = it.getAsFile?.();
        if (f) out.push({ path: f.name, file: f });
      }
    }),
  );
  return out;
}

type FileSystemEntry = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file?: (cb: (f: File) => void) => void;
  createReader?: () => {
    readEntries: (cb: (entries: FileSystemEntry[]) => void) => void;
  };
};

async function walkEntry(entry: FileSystemEntry, prefix: string, out: FileLike[]): Promise<void> {
  const path = prefix ? `${prefix}/${entry.name}` : entry.name;
  if (entry.isFile && entry.file) {
    const f = await new Promise<File>((res) => entry.file?.((file) => res(file)));
    out.push({ path, file: f });
  } else if (entry.isDirectory && entry.createReader) {
    const reader = entry.createReader();
    let entries: FileSystemEntry[] = [];
    while (true) {
      const batch = await new Promise<FileSystemEntry[]>((res) =>
        reader.readEntries((es) => res(es)),
      );
      if (batch.length === 0) break;
      entries = entries.concat(batch);
    }
    for (const e of entries) await walkEntry(e, path, out);
  }
}
