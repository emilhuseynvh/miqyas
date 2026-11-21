import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/StaticPage";
import { pageOpenGraph } from "@/lib/seo";
import { site } from "@/lib/site";

const description =
  "Miqyas-da reklam yerləşdirmək: saytda banner yerləri, Telegram kanalında sponsorlu paylaşım və gündəlik icmalda sponsorluq.";

export const metadata: Metadata = {
  title: "Reklam",
  description,
  alternates: { canonical: "/reklam" },
  openGraph: pageOpenGraph({ title: "Miqyas-da reklam", description, path: "/reklam" }),
};

const mailto = `mailto:${site.contactEmail}?subject=${encodeURIComponent("Miqyas-da reklam")}`;

export default function AdvertisePage() {
  return (
    <StaticPage
      title="Miqyas-da reklam"
      lead="Gündəmi bir yerdə izləyən oxuculara brendinizi, məhsulunuzu və ya kampaniyanızı göstərin."
    >
      <h2>Reklam formatları</h2>
      <ul>
        <li>
          <strong>Saytda banner:</strong> ana səhifədə, kateqoriya səhifələrində, xəbər səhifələrində və son xəbərlər
          lentində.
        </li>
        <li>
          <strong>Telegram kanalında sponsorlu paylaşım:</strong>{" "}
          <a href={site.telegramUrl}>{site.telegramUrl.replace("https://", "")}</a> kanalında &quot;Reklam&quot; qeydi ilə.
        </li>
        <li>
          <strong>Gündəlik icmalda sponsorluq:</strong> hər səhər abunəçilərə gedən məktubda qısa sponsor bloku.
        </li>
      </ul>

      <h2>Necə işləyir</h2>
      <p>
        Bizə yazın: hansı formatla və hansı tarixlərdə maraqlandığınızı bildirin. Auditoriya göstəricilərini, mövcud
        yerləri və qiymətləri göndərəcəyik. Banner şəklini və linkini siz təqdim edirsiniz, yerləşdirməni biz edirik.
      </p>
      <p>
        Bütün reklamlar &quot;Reklam&quot; qeydi ilə göstərilir və xəbər məzmunundan ayrılır. Pop-up, səsli və səhifəni
        bağlayan reklam formatları istifadə olunmur.
      </p>

      <h2>Əlaqə</h2>
      <p>
        E-poçt: <a href={mailto}>{site.contactEmail}</a>
      </p>
    </StaticPage>
  );
}
