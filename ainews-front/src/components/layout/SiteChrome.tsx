import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 md:px-6">{children}</main>
      <Footer />
    </>
  );
}
