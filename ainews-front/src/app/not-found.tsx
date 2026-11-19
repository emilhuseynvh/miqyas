import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Səhifə tapılmadı", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="mx-auto mt-20 max-w-[560px] text-center">
        <h1 className="font-serif text-[40px] font-semibold leading-tight tracking-tight">Səhifə tapılmadı</h1>
        <p className="mt-3 text-lg text-muted">Bu ünvanda səhifə yoxdur. Xəbər silinmiş və ya link səhv yazılmış ola bilər.</p>
        <LinkButton href="/" className="mt-6">
          Ana səhifəyə qayıt
        </LinkButton>
      </div>
    </SiteChrome>
  );
}
