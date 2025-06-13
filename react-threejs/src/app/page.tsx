"use client";

import dynamic from "next/dynamic";

const ThreeScene = dynamic(
  () => import("../components/ThreeScene").then((m) => m.ThreeScene),
  { ssr: false }
);

export default function Page() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ThreeScene />
    </div>
  );
}
