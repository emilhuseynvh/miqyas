import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { StaticPage } from "@/components/ui/StaticPage";

export const metadata: Metadata = {
  title: "Məxfilik",
  description: "Miqyasın hansı məlumatları saxladığı, onlardan necə istifadə etdiyi və istifadəçinin məlumatlarını necə idarə edə biləcəyi.",
  alternates: { canonical: "/mexfilik" },
  openGraph: pageOpenGraph({ title: "Məxfilik", description: "Miqyasın hansı məlumatları saxladığı, onlardan necə istifadə etdiyi və istifadəçinin məlumatlarını necə idarə edə biləcəyi.", path: "/mexfilik" }),
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Məxfilik siyasəti" lead="Yalnız xidməti göstərmək və lenti sizə uyğunlaşdırmaq üçün lazım olan məlumatları saxlayırıq.">
      <h2>Hesab məlumatları</h2>
      <ul>
        <li>E-poçt ünvanı, ad və soyad.</li>
        <li>Gündəlik icmala abunə olmusunuzsa, abunəlik e-poçtu və abunəliyin vəziyyəti.</li>
      </ul>

      <h2>Fəaliyyət məlumatları</h2>
      <p>Hesaba daxil olmusunuzsa, aşağıdakılar hesabınıza bağlı saxlanılır:</p>
      <ul>
        <li>oxuduğunuz xəbərlər və onları nə vaxt oxuduğunuz;</li>
        <li>bəyəndiyiniz, bəyənmədiyiniz və saxladığınız xəbərlər;</li>
        <li>&quot;Sizin üçün&quot; lentində sizə göstərilən xəbərlər və &quot;az göstər&quot; dediyiniz xəbərlər;</li>
        <li>seçdiyiniz maraq mövzuları.</li>
      </ul>
      <p>
        Bu məlumatlar yalnız &quot;Sizin üçün&quot; lentini maraqlarınıza uyğunlaşdırmaq və hesab səhifənizdə göstərmək üçün
        istifadə olunur. Üçüncü tərəflərə satılmır və ötürülmür.
      </p>
      <p>
        Hesaba daxil olmamısınızsa, yalnız xəbərin ümumi baxış sayı artır. Kimin baxdığı qeyd olunmur.
      </p>

      <h2>Məlumatlarınızı idarə etmək</h2>
      <ul>
        <li>Oxu tarixçənizi &quot;Oxuduqlarım&quot; səhifəsindən istənilən vaxt silə bilərsiniz.</li>
        <li>Saxladığınız xəbərləri &quot;Saxladıqlarım&quot; səhifəsindən çıxara bilərsiniz.</li>
        <li>Gündəlik icmaldan hər məktubun sonundakı linklə çıxa bilərsiniz.</li>
        <li>Hesabınızın və bütün məlumatlarınızın silinməsi üçün bizə yazın.</li>
      </ul>

      <h2 id="cookie">Cookie faylları</h2>
      <p>Yalnız zəruri cookie-lər istifadə olunur:</p>
      <ul>
        <li>giriş sessiyası (30 gün);</li>
        <li>giriş linki göndərilən e-poçtu yadda saxlamaq üçün müvəqqəti cookie (15 dəqiqə).</li>
      </ul>
      <p>Reklam və üçüncü tərəf izləmə cookie-ləri istifadə olunmur.</p>
    </StaticPage>
  );
}
