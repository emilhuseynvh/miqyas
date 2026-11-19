const copy: Record<string, string> = {
  siyaset:
    "Azərbaycanın daxili və xarici siyasəti: Prezident Administrasiyası, Milli Məclis, hökumət qərarları, diplomatik görüşlər və regional siyasət üzrə son xəbərlər.",
  dunya:
    "Dünyada baş verən əsas hadisələr: beynəlxalq münasibətlər, münaqişələr, seçkilər və qlobal iqtisadiyyat — Azərbaycan mediasının işıqlandırmasında.",
  iqtisadiyyat:
    "Manat məzənnəsi, neft qiymətləri, banklar, vergilər, biznes və maliyyə bazarları üzrə son xəbərlər və rəsmi açıqlamalar.",
  cemiyyet:
    "Sosial məsələlər, təhsil, səhiyyə, kommunal xidmətlər, nəqliyyat və gündəlik həyatla bağlı Azərbaycandan son xəbərlər.",
  hadise:
    "Azərbaycanda baş verən hadisələr, qəzalar, kriminal xəbərlər və məhkəmə prosesləri haqqında son məlumatlar.",
  idman:
    "Futbol, güləş, cüdo, şahmat və digər idman növləri: Azərbaycan millisi, klublar, transferlər və turnir nəticələri.",
  texnologiya:
    "Rəqəmsal xidmətlər, telekommunikasiya, startaplar, kibertəhlükəsizlik və yeni texnologiyalar haqqında xəbərlər.",
  "suni-intellekt":
    "Süni intellekt, ChatGPT kimi dil modelləri, AI tənzimlənməsi və Azərbaycanda süni intellektin tətbiqi haqqında xəbərlər.",
  elm: "Təhsil sistemi, universitetlər, imtahanlar, elmi tədqiqatlar və kəşflər haqqında son xəbərlər.",
  enerji: "Neft və qaz hasilatı, enerji layihələri, bərpa olunan enerji və enerji bazarları üzrə xəbərlər.",
  medeniyyet: "Mədəniyyət, incəsənət, kino, musiqi, ədəbiyyat və şou-biznes dünyasından xəbərlər.",
  region: "Azərbaycanın rayon və şəhərlərindən regional xəbərlər, yerli hadisələr və infrastruktur layihələri.",
};

export function categoryDescription(slug: string, name: string): string {
  return copy[slug] ?? `${name} bölməsi üzrə Azərbaycan mediasından son xəbərlər.`;
}
