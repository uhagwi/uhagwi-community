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
  const lower = (p: string) => p.toLowerCase();

  const claudeMd = files.find((f) => lower(f.path).endsWith('/claude.md') || lower(f.path) === 'claude.md');
  const readme = files.find((f) => lower(f.path).endsWith('/readme.md') || lower(f.path) === 'readme.md');

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
  const oneLiner = extractBlockquote(claudeContent) ?? extractFirstParagraph(claudeContent);
  const purpose = extractSection(claudeContent, ['목적', '역할', '소개']) ?? oneLiner ?? '';
  const personaName = extractPersona(claudeContent);
  const category = inferCategory(claudeContent + ' ' + (title ?? ''));
  const tags = extractTags(claudeContent);

  return {
    title: title?.slice(0, 120),
    one_liner: oneLiner?.slice(0, 200),
    purpose: purpose?.slice(0, 2000),
    body_md: (readmeContent || claudeContent).slice(0, 20000),
    persona_name: personaName?.slice(0, 40),
    components: [...agentNames, ...skillNames].slice(0, 20),
    tags,
    category,
  };
}

function extractH1(md: string): string | undefined {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  return m?.[1]?.replace(/[#*_`]/g, '').trim();
}

function extractBlockquote(md: string): string | undefined {
  const m = md.match(/^>\s*(.+?)$/m);
  return m?.[1]?.trim();
}

function extractFirstParagraph(md: string): string | undefined {
  const cleaned = md
    .replace(/^---[\s\S]*?---/m, '')
    .split(/\n\n+/)
    .map((s) => s.trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('>') && !p.startsWith('|') && p.length > 10);
  return cleaned?.split('\n')[0];
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
  if (/검증|verify|validator|audit|qa|품질/.test(t)) return 'verify';
  if (/개선|improve|refine|polish|리팩터링/.test(t)) return 'improve';
  if (/제안서|proposal|기획서/.test(t)) return 'proposal';
  if (/개발|service|app|api|배포|deploy|fullstack|풀스택/.test(t)) return 'develop';
  return 'other';
}

function extractTags(md: string): string[] {
  const tags = new Set<string>();
  // YAML frontmatter tags 또는 tags: [a, b, c] 패턴
  const fm = md.match(/^tags:\s*\[(.+?)\]/m);
  if (fm?.[1]) {
    fm[1].split(',').forEach((t) => {
      const cleaned = t.trim().replace(/['"]/g, '');
      if (cleaned) tags.add(cleaned);
    });
  }
  // # 해시태그 패턴 (한글·영문 혼용)
  const hash = md.match(/#([가-힣A-Za-z0-9_]{2,20})/g);
  if (hash) hash.slice(0, 5).forEach((t) => tags.add(t.slice(1)));
  return Array.from(tags).slice(0, 8);
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
