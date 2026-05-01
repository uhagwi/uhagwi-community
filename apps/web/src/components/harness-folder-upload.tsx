'use client';

/**
 * 하네스 폴더 업로드 — 외부 진입점.
 * 실제 구현은 ./harness-folder/{filter,parse,use-folder-upload,view}.tsx 로 분할되어 있다.
 */

export { HarnessFolderUploadView as HarnessFolderUpload } from './harness-folder/view';
export type { ParsedHarness, FileLike } from './harness-folder/parse';
