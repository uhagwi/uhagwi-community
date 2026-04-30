// /lab — 개인용 다마고치형 하네스 트래커
// SSR 비활성: localStorage·DOM 의존
import dynamic from 'next/dynamic';

const HarnessLab = dynamic(() => import('./HarnessLab'), { ssr: false });

export const metadata = {
  title: '하네스 랩 · 우하귀',
  description: 'AI 사용을 보이게, 쉽게 만드는 다마고치형 트래커',
};

export default function Page() {
  return <HarnessLab />;
}
