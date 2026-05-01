/**
 * 하네스 폴더 파싱 — 메인 파서 + 추출 헬퍼.
 * CLAUDE.md / README.md / .claude/{agents,skills} 를 읽어 ParsedHarness 생성.
 */

import { isBoilerplate, stripBoilerplate, inferCategory, isValidTag } from './filter';

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

export type FileLike = { path: string; file: File };

export async function parseHarnessFolder(files: FileLike[]): Promise<ParsedHarness> {
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

function findShallowest(files: FileLike[], filename: string): FileLike | undefined {
  const target = filename.toLowerCase();
  const matches = files.filter((f) => {
    const last = f.path.split('/').pop()?.toLowerCase() ?? '';
    return last === target;
  });
  matches.sort((a, b) => a.path.split('/').length - b.path.split('/').length);
  return matches[0];
}

function extractH1(md: string): string | undefined {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  return m?.[1]?.replace(/[#*_`]/g, '').trim();
}

function extractOneLiner(md: string): string | undefined {
  const blockquotes = md.match(/^>\s*(.+?)$/gm);
  if (blockquotes) {
    for (const bq of blockquotes) {
      const text = bq.replace(/^>\s*/, '').replace(/[*_`]/g, '').trim();
      if (!isBoilerplate(text) && text.length > 5) return text;
    }
  }
  const def = extractSection(md, ['한 줄 정의', '한줄 소개', '슬로건', '소개', '한 줄 소개']);
  if (def) {
    const firstLine = def.split('\n').map((l) => l.trim()).find((l) => l && !isBoilerplate(l));
    if (firstLine) return firstLine.replace(/[*_`]/g, '');
  }
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

function extractTags(md: string): string[] {
  const tags = new Set<string>();
  const fm = md.match(/^tags:\s*\[(.+?)\]/m);
  if (fm?.[1]) {
    fm[1].split(',').forEach((t) => {
      const cleaned = t.trim().replace(/['"]/g, '');
      if (isValidTag(cleaned)) tags.add(cleaned);
    });
  }
  const hashRe = /(?:^|[\s(])#([가-힣A-Za-z_][가-힣A-Za-z0-9_]{1,19})/g;
  let m: RegExpExecArray | null;
  while ((m = hashRe.exec(md)) !== null) {
    if (m[1] && isValidTag(m[1])) tags.add(m[1]);
    if (tags.size >= 8) break;
  }
  return Array.from(tags).slice(0, 8);
}

function deriveTitleFromPath(path: string | undefined): string | undefined {
  if (!path) return undefined;
  const folder = path.split('/')[0];
  return folder?.replace(/[_-]+/g, ' ');
}
