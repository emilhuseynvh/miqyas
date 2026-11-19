import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import Link from "next/link";
import { StaticPage } from "@/components/ui/StaticPage";

export const metadata: Metadata = {
  title: "Mənbə siyasəti",
  description: "Miqyasın xəbər mənbələrindən necə istifadə etdiyi, mənbəyə istinad qaydaları və mənbə sahiblərinin müraciət hüquqları.",
  alternates: { canonical: "/menbe-siyaseti" },
  openGraph: pageOpenGraph({ title: "Mənbə siyasəti", description: "Miqyasın xəbər mənbələrindən necə istifadə etdiyi, mənbəyə istinad qaydaları və mənbə sahiblərinin müraciət hüquqları.", path: "/menbe-siyaseti" }),
};

export default function SourcePolicyPage() {
  return (
    <StaticPage title="Mənbə siyasəti" lead="Xəbərlərin müəllif hüququ onları dərc edən saytlara məxsusdur.">
      <ul>
        <li>Xəbərlər mənbələrin açıq RSS lentlərindən və açıq səhifələrindən toplanır.</li>
        <li>Hər xəbərdə mənbənin adı, dərc vaxtı və orijinal səhifəyə keçid göstərilir.</li>
        <li>Xəbərin mətninə və başlığına redaktə edilmir.</li>
      </ul>
      <h2>Mənbə sahibləri üçün</h2>
      <p>
        Saytınızın xəbərlərinin burada göstərilməsini istəmirsinizsə və ya hər hansı xəbərin silinməsini tələb edirsinizsə,{" "}
        <Link href="/elaqe">bizimlə əlaqə saxlayın</Link>. Müraciətə 2 iş günü ərzində baxırıq və mənbəni dərhal deaktiv edə bilirik.
      </p>
    </StaticPage>
  );
}
