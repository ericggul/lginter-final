import dynamic from "next/dynamic";

const SbmScreen = dynamic(() => import("@/components/sbm"), { ssr: false });

export default function SbmSlugPage() {
  return <SbmScreen />;
}
