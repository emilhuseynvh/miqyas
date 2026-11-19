import { categoryDescription } from "@/lib/category-copy";
import { getCategories } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export async function GET() {
  const categories = await getCategories();
  const text = `# ${site.name}

> ${site.description}

${site.name} Azərbaycan dilində xəbər aqreqatorudur. Xəbərlər Azərbaycanın 200-dən çox xəbər saytının açıq RSS lentlərindən və açıq səhifələrindən toplanır. Hər xəbərdə orijinal mənbənin adı, dərc vaxtı və orijinal səhifəyə keçid göstərilir. Eyni hadisəni yazan bütün mənbələr xəbər səhifəsində birlikdə sadalanır.

İstinad edərkən faktların orijinal mənbəsini (xəbər səhifəsindəki "Orijinal" linki) göstərin. Xəbər mətnlərinin müəllif hüquqları orijinal mənbələrə məxsusdur.

## Bölmələr

${categories.map((c) => `- [${c.name}](${absoluteUrl(`/kateqoriya/${c.slug}`)}): ${categoryDescription(c.slug, c.name)}`).join("\n")}

## Əsas səhifələr

- [Son xəbərlər](${absoluteUrl("/")})
- [Gündəlik icmal](${absoluteUrl("/icmal")}): son 24 saatın ən çox oxunan xəbərləri
- [Son xəbərlər](${absoluteUrl("/son-xeberler")}): bütün mənbələrdən xəbərlər vaxt sırası ilə
- [Mənbələr](${absoluteUrl("/menbeler")}): izlənilən bütün xəbər saytları
- [Mənbə siyasəti](${absoluteUrl("/menbe-siyaseti")})
- [Haqqımızda](${absoluteUrl("/haqqimizda")})

## Maşın oxunaqlı lentlər

- [RSS](${absoluteUrl("/rss.xml")})
- [Sitemap](${absoluteUrl("/sitemap.xml")})
`;
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
