import { Flash } from "./ui";

type Params = Record<string, string | string[] | undefined>;

const okMessages: Record<string, string> = {
  "ingestion-started": "Toplama başladı. Bir neçə saniyədən sonra səhifəni yeniləyin.",
  activated: "Mənbə aktiv edildi.",
  deactivated: "Mənbə deaktiv edildi, artıq toplanmayacaq.",
  fetched: "Mənbə yoxlanıldı.",
  "feed-saved": "RSS linki yadda saxlanıldı.",
};

const errorMessages: Record<string, string> = {
  FETCH_FAILED: "Mənbəni oxumaq alınmadı",
  VALIDATION: "Məlumat düzgün deyil. RSS linki http:// və ya https:// ilə başlamalıdır.",
  UNAVAILABLE: "API-yə qoşulmaq alınmadı. Backend işləyirmi?",
};

const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

export function AdminFlash({ params }: { params: Params }) {
  const ok = one(params.ok);
  const error = one(params.xeta);
  const info = one(params.info);

  if (error) {
    const base = errorMessages[error] ?? "Əməliyyat alınmadı.";
    return <Flash tone="bad">{info ? `${base}: ${info}` : base}</Flash>;
  }
  if (ok && okMessages[ok]) {
    const [found, inserted, skipped] = info?.split(":") ?? [];
    const skippedNote = Number(skipped) > 0 ? ` ${skipped} xəbər şəkli və ya mətni olmadığı üçün ötürüldü.` : "";
    const detail = found !== undefined ? ` Feed-də ${found} xəbər var, ${inserted} yenisi əlavə olundu.${skippedNote}` : "";
    return <Flash tone="ok">{okMessages[ok] + detail}</Flash>;
  }
  return null;
}
