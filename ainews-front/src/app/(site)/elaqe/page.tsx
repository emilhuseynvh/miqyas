import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { StaticPage } from "@/components/ui/StaticPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Əlaqə",
  description: "Miqyas redaksiyası ilə əlaqə: təklif, səhv bildirişi və mənbə müraciətləri üçün.",
  alternates: { canonical: "/elaqe" },
  openGraph: pageOpenGraph({ title: "Əlaqə", description: "Miqyas redaksiyası ilə əlaqə: təklif, səhv bildirişi və mənbə müraciətləri üçün.", path: "/elaqe" }),
};

export default function ContactPage() {
  return (
    <StaticPage title="Əlaqə" lead="Təklif, səhv bildirişi və ya mənbə müraciəti üçün bizə yazın.">
      <p>
        E-poçt: <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
      </p>
      <p>Mənbə sahibləri müraciətdə saytın ünvanını və tələbi (xəbərin silinməsi və ya mənbənin dayandırılması) qeyd etsinlər.</p>
    </StaticPage>
  );
}
