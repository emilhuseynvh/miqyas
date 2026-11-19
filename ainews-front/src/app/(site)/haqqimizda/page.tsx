import type { Metadata } from "next";
import { faqSchema, pageOpenGraph, type Faq } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { StaticPage } from "@/components/ui/StaticPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Haqqımızda",
  description: "Miqyas Azərbaycanın xəbər saytlarını bir yerdə toplayan xəbər platformasıdır: necə işlədiyimiz, mənbələrlə necə davrandığımız və redaksiya prinsiplərimiz.",
  alternates: { canonical: "/haqqimizda" },
  openGraph: pageOpenGraph({ title: "Haqqımızda", description: "Miqyas Azərbaycanın xəbər saytlarını bir yerdə toplayan xəbər platformasıdır: necə işlədiyimiz, mənbələrlə necə davrandığımız və redaksiya prinsiplərimiz.", path: "/haqqimizda" }),
};

const faqs: Faq[] = [
  {
    question: `${site.name} nədir?`,
    answer: `${site.name} Azərbaycan dilində xəbər aqreqatorudur: Azərbaycanın 200-dən çox xəbər saytından son xəbərləri bir yerdə toplayır, mövzu bölmələrinə ayırır və eyni hadisəni yazan bütün mənbələri birlikdə göstərir.`,
  },
  {
    question: "Xəbərlər haradan gəlir?",
    answer: "Xəbərlər Azərbaycan xəbər saytlarının açıq RSS lentlərindən və açıq səhifələrindən hər 10 dəqiqədən bir toplanır. Hər xəbərdə orijinal mənbənin adı, dərc vaxtı və orijinal səhifəyə keçid göstərilir.",
  },
  {
    question: `${site.name} digər xəbər saytlarından nə ilə fərqlənir?`,
    answer: `${site.name} özü xəbər yazmır. Eyni hadisə haqqında yazan bütün mənbələri bir səhifədə göstərir ki, oxucu hadisəni fərqli saytların necə təqdim etdiyini müqayisə edə bilsin.`,
  },
  {
    question: `${site.name} pulsuzdur?`,
    answer: "Bəli. Bütün xəbərlər, bölmələr və gündəlik e-poçt icmalı pulsuzdur. Hesab yaratsanız, maraqlarınıza uyğun fərdi xəbər lenti və saxlanılan xəbərlər də əlçatan olur.",
  },
  {
    question: `${site.name}-dakı xəbərə necə istinad etməli?`,
    answer: `Faktlar üçün xəbərin orijinal mənbəsinə istinad edin: hər xəbər səhifəsində "Orijinal" linki var. Xəbər mətnlərinin müəllif hüquqları orijinal mənbələrə məxsusdur.`,
  },
  {
    question: "Mənbə sahibi xəbərin silinməsini necə istəyə bilər?",
    answer: `Əlaqə səhifəsindən və ya ${site.contactEmail} ünvanına saytın ünvanını və tələbi (xəbərin silinməsi və ya mənbənin dayandırılması) yazın.`,
  },
];

export default function AboutPage() {
  return (
    <StaticPage title="Haqqımızda" lead={`${site.name} Azərbaycan dilində xəbərləri bir yerdə toplayan və onları anlamağı asanlaşdıran platformadır.`}>
      <p>
        Hər gün yüzlərlə sayt minlərlə xəbər dərc edir. Eyni hadisə on fərqli başlıqla yazılır, vacib olan isə səs-küyün içində itir. Biz bu
        xəbərləri bir yerə yığırıq, bölmələrə ayırırıq və oxucuya aydın şəkildə təqdim edirik.
      </p>
      <h2>Necə işləyirik</h2>
      <ul>
        <li>200-dən çox Azərbaycan xəbər saytının açıq RSS lentlərini hər 10 dəqiqədən bir oxuyuruq.</li>
        <li>Hər xəbərin yanında orijinal mənbə və ona keçid göstərilir.</li>
        <li>Xəbərlər mövzu bölmələrinə avtomatik ayrılır, ən çox oxunanlar ayrıca göstərilir.</li>
      </ul>
      <h2>Süni intellekt</h2>
      <p>
        Yaxın vaxtlarda eyni hadisə haqqında yazan mənbələri bir hekayədə birləşdirəcək, qısa xülasə və fərqli baxışların müqayisəsini təqdim
        edəcəyik. Süni intellektin hazırladığı hər mətndə mənbələr göstəriləcək.
      </p>
      <h2>Tez-tez verilən suallar</h2>
      {faqs.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
      <JsonLd data={faqSchema(faqs, "/haqqimizda")} />
    </StaticPage>
  );
}
