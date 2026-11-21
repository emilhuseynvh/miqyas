import type { ReactNode } from "react";
import { RailAd } from "@/components/ads/HouseAds";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1640px] flex-1 justify-center min-[1440px]:gap-2 min-[1440px]:px-4">
      <RailAd />
      <div className="flex min-w-0 max-w-[1240px] flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 md:px-6">{children}</main>
        <Footer />
      </div>
      <RailAd />
    </div>
  );
}
