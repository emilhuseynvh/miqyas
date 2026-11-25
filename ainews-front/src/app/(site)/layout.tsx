import { AdSense } from "@/components/analytics/AdSense";
import { Clarity } from "@/components/analytics/Clarity";
import { SiteChrome } from "@/components/layout/SiteChrome";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <SiteChrome>
      {children}
      <Clarity />
      <AdSense />
    </SiteChrome>
  );
}
