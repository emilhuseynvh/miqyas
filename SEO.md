# Miqyas — SEO / GEO hesabatı

Domen: `https://miqyas.site`. Yoxlama `next build` + `next start` (prod rejim), Googlebot user-agent ilə aparılıb.

## 1. Əsas qərar: xəbər səhifələri niyə `noindex`

Xəbər səhifələri üçüncü tərəf saytların mətnini tam göstərir. Google bunu "scraped content" sayır: belə səhifələr həm sıralanmır, həm də bütün domenin keyfiyyət siqnalını aşağı salır (Helpful Content / spam siyasəti). Ona görə:

- `/xeber/*` → `noindex, follow` + öz canonical-ı. Linklər izlənir, səhifə indeksə düşmür.
- İndekslənən səhifələr: ana səhifə, 12 kateqoriya, mənbə səhifələri, `/menbeler`, statik səhifələr. Bu səhifələrdə mətn Miqyasın özünündür (kateqoriya təsvirləri, mənbə siyahısı, qruplaşdırma).
- **İstisna — AI xülasəli hadisələr:** ən azı 3 mənbənin yazdığı hadisələr üçün Gemini (pulsuz plan) öz xülasəmizi yazır. Belə hadisənin əsas xəbər səhifəsi indekslənir, `sitemap.xml`-ə və `news-sitemap.xml`-ə düşür. Bu səhifədə kopya mətn yoxdur: öz başlığımız, öz xülasəmiz, mənbədən qısa təsvir və "Tam oxu" linki, bütün mənbələrin siyahısı. Hadisənin digər mənbələrdəki səhifələri `noindex` qalır.

## 2. Görülən işlər

| Sahə | Nə edildi | Status |
|---|---|---|
| Title / description | Hər səhifəyə unikal title (şablon `%s — Miqyas`), ≤158 simvol description; kateqoriyada səhifə nömrəsi title-a düşür | Edildi, yoxlanıb |
| Canonical | Hər indekslənən səhifədə öz canonical-ı; səhifələnmədə `?sehife=N` canonical-da qalır; root layout-dan miras canonical çıxarıldı (private və 404 səhifələri artıq ana səhifəyə canonical vermir) | Edildi, yoxlanıb |
| Robots meta | Private səhifələr (`/hesab*`, `/axtaris`, `/sizin-ucun`, `/tarixce`, `/saxlanilanlar`, admin, icmal təsdiq/çıxış) `noindex, nofollow`; 404 `noindex` | Edildi, yoxlanıb |
| Real 404 | Mövcud olmayan xəbər/kateqoriya/mənbə/səhifə HTTP 404 qaytarır (əvvəl streaming səbəbindən 200 "soft 404" idi). `htmlLimitedBots` ilə metadata `<head>`-də | Edildi, yoxlanıb |
| robots.txt | Private yollar bağlı, AI crawler-lər (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) bloklanmır, sitemap göstərilir | Edildi, yoxlanıb |
| sitemap.xml | Ana səhifə, kateqoriyalar, mənbələr, statik səhifələr; xəbərlərdən yalnız AI xülasəli hadisələr | Edildi, XML valid |
| news-sitemap.xml | Son 48 saat, Google News formatı; hazırda 404 (xəbərlər noindex olduğu üçün) | Hazırdır, söndürülüb |
| RSS | `/rss.xml` və hər kateqoriya üçün `/kateqoriya/{slug}/rss.xml`, `<head>`-də `alternate` | Edildi, XML valid |
| Structured data | `NewsMediaOrganization`, `WebSite` + `SearchAction`, `CollectionPage` + `ItemList`, `BreadcrumbList`, xəbərdə `NewsArticle` (`isBasedOn` orijinal URL, `sourceOrganization` mənbə) | Edildi, JSON-LD yoxlanıb |
| Breadcrumbs | Görünən breadcrumb (kateqoriya, mənbə, xəbər) + schema | Edildi |
| Open Graph / Twitter | Bütün səhifələrdə og:title/description/url/image; xəbərdə `article` tipi, publishedTime, section; default `/opengraph-image` (1200×630) | Edildi, yoxlanıb |
| Logo | `/logo.png` (512×512) Organization schema üçün | Edildi |
| H1 | Hər səhifədə bir H1 (ana səhifədə sr-only) | Edildi, yoxlanıb |
| Kateqoriya mətni | 12 kateqoriyaya Azərbaycan dilində təsvir (səhifədə görünür, description-da istifadə olunur) | Edildi |
| `/menbeler` | Bütün aktiv mənbələrin indeks səhifəsi (xəbər sayı ilə), footer-də link | Edildi |
| GEO | `/llms.txt`: sayt nədir, necə istinad etmək lazımdır, bölmələr və mənbə siyasəti linkləri | Edildi, yoxlanıb |
| Ad / domen | Bütün kodda, e-poçt şablonlarında, OG şəkillərində ad **Miqyas**, `site.url` default `https://miqyas.site` | Edildi |

## 3. Xarici konfiqurasiya tələb edənlər

Bunları kod edə bilməz, sizin hesabınızla edilməlidir:

1. **Google Search Console** — `miqyas.site`-ı domen property kimi əlavə edin, verification kodunu `GOOGLE_SITE_VERIFICATION` env-ə yazın (və ya DNS TXT ilə təsdiqləyin), sonra `https://miqyas.site/sitemap.xml` göndərin.
2. **Bing Webmaster Tools** — eyni qayda ilə, `BING_SITE_VERIFICATION`. Bing həm də ChatGPT axtarışının mənbəyidir.
3. **SITE_URL build zamanı** — `SITE_URL=https://miqyas.site npm run build`. Əks halda robots/sitemap/rss/llms içində `localhost` qalır (DEPLOY.md-də qeyd olunub).
4. **Google News Publisher Center** — hazırda tövsiyə olunmur: Google News aqreqator saytları (başqasının mətnini təkrarlayan) qəbul etmir. Öz redaksiya məzmunu yarandıqdan sonra müraciət edin.
5. **Analitika (GA4)** — əlavə edilməyib. Məxfilik səhifəsində "üçüncü tərəf izləmə cookie-si yoxdur" yazılıb; GA4 əlavə etmək bu vədi pozar və cookie banner tələb edər. Alternativ: Search Console (cookie-siz) + öz baxış sayğacımız (artıq var). Lazım olsa cookie-siz analitika (Plausible / Umami self-host) tövsiyə olunur.
6. **Əlaqə e-poçtu** — `/elaqe` və schema-da hələ `info@example.az` placeholder-dir; real ünvanla əvəz edin.

## 4. Edilməyənlər və səbəbi

- **Xəbər səhifələrinin indekslənməsi** — yuxarıdakı səbəbə görə qəsdən söndürülüb.
- **Footer şəkilləri** — hələ picsum placeholder-dir; real şəkil/qrafika ilə əvəz olunmalıdır (SEO təsiri azdır, amma keyfiyyət görüntüsü üçün vacibdir).
- **Rəqib metrikaları** — oxu.az, report.az, apa.az, qafqazinfo.az, trend.az, azertag.az kimi saytların trafik/backlink rəqəmlərini yoxlaya bilmədim (Ahrefs/Semrush girişi yoxdur), ona görə rəqəm uydurmuram.

## 5. Rəqib mənzərəsi (keyfiyyət baxımından)

Azərbaycan xəbər axtarışında üstünlük orijinal xəbər yazan, uzun illərdir domen etibarı olan saytlardadır. Miqyas onlarla "ilk xəbər" yarışında qalib gələ bilməz. Real fürsətlər:

- **"Eyni hadisəni kim necə yazıb"** — heç bir yerli sayt bunu vermir. Bu, Miqyasın unikal dəyəridir və gələcəkdə indekslənən "hadisə səhifəsi" (story page) üçün əsasdır.
- **Mövzu səhifələri** — "manat məzənnəsi", "neft qiyməti", "imtahan nəticələri" kimi daim axtarılan mövzular üçün öz mətni olan, xəbərləri bir yerə yığan səhifələr.
- **Mənbə şəffaflığı** — `/menbeler` və mənbə siyasəti E-E-A-T üçün müsbət siqnaldır.

## 6. Növbəti addımlar (prioritet sırası ilə)

1. Deploy: `SITE_URL` build zamanı, Search Console + Bing təsdiqi, sitemap göndərmək.
2. Real əlaqə e-poçtu və footer şəkilləri.
3. **Hadisə səhifələri** (`/hadise/{slug}`): bir neçə mənbənin yazdığı hadisə üçün AI ilə hazırlanmış öz xülasə + mənbələrin müqayisəsi + timeline. Bu səhifələr indekslənə bilər — saytın əsas orqanik trafik mənbəyi bu olacaq. İlk addım edilib: AI xülasəli hadisə səhifələri indekslənir.
4. Mövzu (topic) səhifələri və onların daxili linklənməsi.
5. Search Console-da 4–6 həftə sonra indeksləmə hesabatına baxıb kateqoriya təsvirlərini real sorğulara görə yeniləmək.
