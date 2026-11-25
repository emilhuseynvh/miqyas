# Prodakşına çıxış qeydləri

## Arxitektura

```
Brauzer → nginx (HTTPS) → Next.js (ainews-front, :3000) → NestJS API (ainews-api, :4000) → PostgreSQL 16
```

Brauzer API-yə birbaşa müraciət etmir, bütün sorğular Next.js serverindən gedir. API-ni internetə açmaq lazım deyil, yalnız Next.js serveri ona çata bilməlidir.

## Serverdə görüləcək işlər

### Toplayıcını ayrıca prosesə çıxarmaq
Hazırda RSS toplama, tam mətnin çıxarılması (jsdom), hekayələrin birləşdirilməsi və gündəlik icmalın göndərilməsi API ilə eyni prosesdə işləyir. Tam mətnin çıxarılması CPU-nu yükləyir və bu vaxt API cavabları yavaşlayır. Serverdə:

- API prosesi `INGESTION_ENABLED=false` ilə işə salınır (yalnız HTTP sorğularına cavab verir).
- Eyni kod ikinci proses kimi `INGESTION_ENABLED=true` ilə işə salınır (yalnız fon işləri). Bu proses ayrıca porta qulaq asır, amma ona trafik yönləndirilmir.

Daha sonra bu ikinci proses üçün ayrıca giriş nöqtəsi (HTTP serversiz) yazıla bilər.

### Tək nüsxə şərti
Lent keşi, toplama vəziyyəti və sorğu limitləri hər prosesin yaddaşındadır. Fon işləri olan prosesdən yalnız **bir** nüsxə işləməlidir, əks halda xəbərlər iki dəfə toplanar və icmal iki dəfə göndərilər. API prosesini çoxaltmaq lazım olsa, limitlər üçün Redis saxlama qatı qoşulmalıdır.

### Deploy ardıcıllığı
1. PostgreSQL işləyir, `pg_trgm` əlavəsi quraşdırılıb (miqrasiya özü yaradır, amma istifadəçinin buna icazəsi olmalıdır).
2. API işə salınır — miqrasiyalar açılışda avtomatik işləyir.
3. **Sonra** frontend build olunur: `next build` ana səhifəni əvvəlcədən hazırlamaq üçün API-yə müraciət edir, API işləmirsə build uğursuz olur.
4. Frontend işə salınır.

### Mühit dəyişənləri
- `ainews-api/.env.example` və `ainews-front/.env.example` şablon kimi istifadə olunur.
- `NODE_ENV=production`, `APP_URL` və `SITE_URL` real domen olmalıdır.
- Frontend-də `SITE_URL=https://miqyas.site` **build zamanı** da verilməlidir: `robots.txt`, `sitemap.xml`, `rss.xml`, `llms.txt` statik generasiya olunur və domeni build vaxtı götürür. `.env.local`-dakı `localhost` dəyəri prod build-ə düşməməlidir.
- SEO üçün əlavə env: `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` (Search Console / Bing Webmaster-dən alınan kod).
- AI xülasə: `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-3.5-flash-lite`), `SUMMARY_DAILY_LIMIT` (default 300). Xülasə gündəmdəki hadisələrə (3+ mənbə, gündəm balına görə) yazılır. Xülasələri yalnız `INGESTION_ENABLED=true` olan proses yazır.
- Google AdSense: `ADSENSE_CLIENT=ca-pub-...` frontend env-inə (`/etc/miqyas/web.env`) yazılır və frontend yenidən build olunur. Bundan sonra saytda AdSense skripti, `google-adsense-account` meta teqi, `/ads.txt` və məxfilik səhifəsində reklam bölməsi avtomatik aktivləşir. Aİ ziyarətçiləri üçün AdSense panelində Privacy & messaging bölməsindən Google-un razılıq bannerini aktiv edin.
- Telegram kanalı: `TELEGRAM_BOT_TOKEN` (@BotFather-dən), `TELEGRAM_CHANNEL_ID` (`@kanal_adi` və ya `-100...`), `TELEGRAM_DAILY_LIMIT` (default 25). Bot kanalda admin olmalıdır və "Post messages" icazəsi verilməlidir. Bot gündəmdən AI xülasəli hadisələri paylaşır: ən azı 20 dəqiqə aralıqla, gecə 00:00-07:00 yalnız "Son dəqiqə" xəbərləri; səhər 08:00-da günün əsas xəbərləri icmalı. Hər iki iş yalnız `INGESTION_ENABLED=true` olan prosesdə işləyir.
- `JWT_SECRET`, `MAGIC_LINK_SECRET`, `INTERNAL_API_TOKEN` yenidən yaradılmalıdır: `openssl rand -hex 32`. `INTERNAL_API_TOKEN` hər iki tərəfdə eyni olmalıdır.
- Development zamanı söhbətdə açıq yazılmış Gmail app password, Gemini key və admin şifrəsi yenisi ilə əvəz olunmalıdır. Admin şifrəsi: `ADMIN_PASSWORD='...' npm run admin:create -- --email ...`.

### nginx
- `X-Forwarded-For` başlığını Next.js-ə ötürməlidir — istifadəçinin real IP-si sorğu limitləri üçün buradan götürülür.
- Next.js-ə proxy edir; API-yə xaricdən yol açılmır.

### E-poçt
Gmail SMTP gündə ~500 məktubla məhdudlaşır və məktublar spama düşə bilər. Gündəlik icmal abunəçiləri artanda öz domeninizlə tranzaksion e-poçt xidmətinə (məsələn Resend) keçin və domen üçün SPF/DKIM qeydlərini qurun.

### Monitorinq və backup
- PostgreSQL üçün gündəlik avtomatik backup.
- Xəta izləmə (məsələn Sentry) və uptime yoxlaması.
