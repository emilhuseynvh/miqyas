# ainews-api

NestJS 12, TypeORM, PostgreSQL. Şifrəsiz giriş: istifadəçiyə e-poçtla link göndərilir.

## Başlamaq

```bash
cp .env.example .env
createdb ainews
npm install
npm run start:dev
```

API `http://localhost:4000/api` ünvanında işləyir. Miqrasiyalar tətbiq açılanda avtomatik işləyir.

SMTP doldurulmayıbsa, e-poçt göndərilmir və link API logunda göstərilir.

## Giriş axını

1. `POST /api/auth/magic-link` `{ email }`. Hesab varsa, giriş linki göndərilir. Yoxdursa, qeydiyyat linki göndərilir.
2. `POST /api/auth/verify` `{ token }`
   - Giriş linki: `{ status: "authenticated", accessToken, user }`. Link bir dəfəlikdir.
   - Qeydiyyat linki: `{ status: "registration_required", email }`
3. `POST /api/auth/register` `{ token, firstName, lastName }`: hesabı yaradır və `accessToken` qaytarır.

## İstifadəçilər

| Endpoint | Rol |
| --- | --- |
| `GET /api/users/me` | istənilən istifadəçi |
| `GET /api/users` | admin |
| `PATCH /api/users/:id/role` `{ role }` | admin |

Sorğularda `Authorization: Bearer <accessToken>` başlığı göndərilir. `ADMIN_EMAILS` siyahısındakı ünvanlar qeydiyyatdan keçəndə avtomatik `admin` rolunu alır.

## Miqrasiyalar

```bash
npm run migration:run
npm run migration:revert
```

## Xəbər toplama

Aktiv mənbələrin RSS-i API açılandan 5 saniyə sonra və sonra hər 10 dəqiqədən bir oxunur. `INGESTION_ENABLED=false` ilə söndürülür. Eyni URL-li məqalə ikinci dəfə yazılmır.

Bazaya yalnız başlığı, şəkli və təsviri olan xəbər yazılır. RSS-də şəkil və ya təsvir yoxdursa, son 48 saatın yeni xəbərləri üçün xəbərin səhifəsi açılır: şəkil `og:image`-dən, təsvir `og:description`-dan və ya mətnin ilk abzasından götürülür, tam mətn də eyni anda saxlanılır. Bir dövrdə hər mənbədən ən çox 30 xəbər belə tamamlanır, qalanları növbəti dövrə keçir. Tamamlana bilməyən xəbər yazılmır.

```bash
npm run seed:sources
ADMIN_PASSWORD='...' npm run admin:create -- --email admin@example.com --first-name Ad --last-name Soyad
```

`seed:sources` siyahını `src/database/seeds/sources.data.ts` faylından yükləyir, artıq bazada olan mənbələri ötürür. `admin:create` mövcud istifadəçini admin edir və şifrəsini dəyişir, yoxdursa yeni admin yaradır.

## Admin endpointləri

`GET /api/admin/overview`, `GET|POST /api/admin/sources`, `PATCH /api/admin/sources/:id`, `POST /api/admin/sources/:id/fetch`, `POST /api/admin/ingestion/run`, `GET /api/admin/articles`. Admin girişi: `POST /api/auth/admin/login` `{ email, password }`.

## Sayt üçün açıq endpointlər

- `GET /api/categories`: kateqoriyalar
- `GET /api/news?category=&page=&limit=&withImage=&perSource=`: xəbərlər, ən yenidən köhnəyə. Yalnız Azərbaycan dilli aktiv mənbələr göstərilir. `perSource` eyni mənbədən ən çox neçə xəbər gələcəyini məhdudlaşdırır.
- `GET /api/news/:slug`: xəbər (tam mətnlə) və digər mənbələrdən oxşar xəbərlər. Köhnə linklər üçün UUID ilə də işləyir.

Xəbərin kateqoriyası feed-dəki etiketlərdən avtomatik təyin olunur (`src/categories/category-detector.ts`). Köhnə xəbərləri yenidən təsnif etmək üçün: `npm run articles:categorize`.

## Tam mətn

Xəbərin tam mətni orijinal səhifədən Mozilla Readability ilə çıxarılır və `articles.content` sütununda saxlanılır. Son 48 saatın xəbərləri dəqiqədə bir partiya (120 xəbər) emal olunur. Hələ emal olunmamış xəbər açılanda mətn həmin an çəkilir.

## "Sizin üçün" lenti

`GET /api/feed?page=&limit=` istifadəçinin maraqlarına görə sıralanmış yeni xəbərləri qaytarır. Daxil olmayan istifadəçi üçün təzə və populyar xəbərlərdən ibarətdir. `PUT /api/me/hidden/:id` ("az göstər") və `PUT /api/me/interests` (`{ categories: [slug] }`) əlavə siqnal verir.

Alqoritm (`src/recommendations`):

1. **Maraq profili** (`profile.ts`) — oxu +1, kəşfdən açılan oxu +2, bəyən +3, saxla +4, bəyənmə −4, az göstər −6, seçilmiş mövzu +10, göstərilib açılmayan xəbər hər dəfə −0.2. Kateqoriya, mənbə və başlıqdakı açar sözlər üçün ayrıca hesablanır.
2. **İki qat** — uzunmüddətli (14 günlük yarımömür) və bu günkü (6 saatlıq yarımömür) maraq `0.6 / 0.4` nisbətində birləşir. Siqnal 10-dan azdırsa, maraq çəkisi proporsional azaldılır.
3. **Açar sözlər** (`keywords.ts`) — başlıqdan stopword-lar atılır, sözlər ilk 6 hərfə görə kökə salınır ("Qarabağın" → "qaraba"), nadir sözlər daha çox çəki alır.
4. **Namizədlər** — son 48 saatın şəkilli xəbərləri. İstifadəçinin oxuduğu, bəyəndiyi, saxladığı, gizlətdiyi və 3 dəfə göstərilib açmadığı xəbərlər çıxarılır.
5. **Bal** (`ranking.ts`) — `0.30 × kateqoriya + 0.10 × mənbə + 0.15 × açar söz + 0.20 × populyarlıq + 0.25 × təzəlik`.
6. **Qarışdırma** — eyni kateqoriyadan ardıcıl 2-dən çox, eyni mənbədən ardıcıl 2 xəbər olmur, ilk 10-da mənbələr təkrarlanmır. Kəşf payı yeni istifadəçidə ~30%, 50 siqnaldan sonra ~15%-dir və kəşf yerləri fərqli mövzular arasında fırlanır.

Hər oxu, reaksiya və saxlama istifadəçinin lent keşini dərhal təmizləyir, əks halda sıralama 3 dəqiqə saxlanılır. Lentdə göstərilən xəbərlər `feed_impressions` cədvəlinə yazılır (30 dəqiqədə bir dəfədən çox sayılmır).

Testlər: `npx vitest run`.

## Gündəlik icmal

`POST /api/newsletter/subscribe` → təsdiq məktubu (double opt-in) → `POST /api/newsletter/confirm`. Hər səhər 08:00–12:00 (Bakı) arası 10 dəqiqədən bir hələ bu gün icmal almamış aktiv abunəçilərə göndərilir — restart olsa da təkrar göndərilmir. Hər məktubda `List-Unsubscribe` başlığı və abunəlikdən çıxma linki var. Admin önizləmə: `GET /api/admin/newsletter/preview`.

## Eyni xəbərlərin birləşdirilməsi

Hər xəbərin başlığı normallaşdırılır (`src/common/title-key.ts`) və `pg_trgm` ilə son 24 saatın xəbərləri ilə müqayisə olunur. Oxşarlıq 0.50 və yuxarıdırsa xəbər həmin hekayəyə (`stories`) qoşulur, əks halda yeni hekayə yaranır. Siyahılarda və lentdə hər hekayədən yalnız əsas xəbər (ən erkən, şəkilli) göstərilir, xəbər səhifəsində isə hekayəni yazan bütün mənbələr. Toplamadan sonra və hər 5 dəqiqədən bir işləyir.

## Sorğu limitləri

API-yə sorğular Next.js serverindən gəlir. Next.js hər sorğuya `x-internal-token` (`INTERNAL_API_TOKEN`) və istifadəçinin IP-sini (`x-client-ip`) əlavə edir; API limitləri bu IP-yə görə sayır. Token olmadan `x-client-ip` nəzərə alınmır.
