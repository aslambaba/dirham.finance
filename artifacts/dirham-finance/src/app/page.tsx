"use client";

import dynamic from "next/dynamic";

const Home = dynamic(() => import("@/components/home-page"), {
  ssr: false,
});

export default function Page() {
  return <Home />;
}
