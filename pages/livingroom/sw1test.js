import dynamic from "next/dynamic";

// SW1 테스트용 페이지: 기존 SW1 페이지는 그대로 두고,
// 이 페이지에서만 SW1test 컴포넌트를 사용해 안전하게 실험할 수 있다.
const SW1TestControls = dynamic(
  () => import("@/components/livingroom/SW1test"),
  { ssr: false }
);

export default function SW1TestPage() {
  return <SW1TestControls />;
}



