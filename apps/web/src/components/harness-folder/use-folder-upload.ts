'use client';

/**
 * 하네스 폴더 업로드 — 상태·이벤트 훅.
 * 파일 수집(input/DataTransfer) → parseHarnessFolder 호출 → 콜백 + 통계 업데이트.
 */

import { useRef, useState } from 'react';
import { parseHarnessFolder, type FileLike, type ParsedHarness } from './parse';

export type FolderStats = {
  folder: string;
  files: number;
  agents: number;
  skills: number;
};

export function useFolderUpload(onParsed: (data: ParsedHarness) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FolderStats | null>(null);
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

  return {
    inputRef,
    parsing,
    error,
    stats,
    dragOver,
    setDragOver,
    openPicker,
    onInputChange,
    onDrop,
  };
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
