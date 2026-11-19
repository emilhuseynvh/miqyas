import { FormNotice } from "@/components/auth/FormNotice";

const messages: Record<string, { tone: "success" | "error"; text: string }> = {
  gonderildi: { tone: "success", text: "Təsdiq məktubu göndərdik. E-poçtundakı linkə keçəndən sonra abunəlik aktiv olacaq." },
  movcud: { tone: "success", text: "Bu e-poçt artıq abunədir. Hər səhər 08:00-da icmal göndəririk." },
  tesdiqlendi: { tone: "success", text: "Abunəlik təsdiqləndi. Sabah səhər 08:00-da ilk icmalı alacaqsan." },
  etibarsiz: { tone: "error", text: "Təsdiq linki etibarsızdır və ya artıq istifadə olunub. Yenidən abunə ol." },
  limit: { tone: "error", text: "Çox sayda cəhd edildi. Bir dəqiqə gözləyib yenidən yoxla." },
  xeta: { tone: "error", text: "Abunə olmaq alınmadı. E-poçt ünvanını yoxlayıb yenidən cəhd et." },
};

export function SubscribeNotice({ status }: { status?: string }) {
  const message = status ? messages[status] : undefined;
  if (!message) return null;
  return (
    <div className="mt-16 -mb-12">
      <FormNotice tone={message.tone}>{message.text}</FormNotice>
    </div>
  );
}
