import type { ApiErrorCode } from "./api";

const messages: Record<ApiErrorCode, string> = {
  INVALID_LINK: "Bu link etibarsızdır. Yeni link istəyin.",
  EXPIRED_LINK: "Linkin müddəti bitib. E-poçtunuzu yenidən daxil edin, yeni link göndərək.",
  LINK_ALREADY_USED: "Bu link artıq istifadə olunub. Yeni link istəyin.",
  ACCOUNT_EXISTS: "Bu e-poçtla hesab artıq var. Daxil olmaq üçün yeni link istəyin.",
  INVALID_CREDENTIALS: "E-poçt və ya şifrə yanlışdır, ya da bu hesabın admin girişi yoxdur.",
  UNAUTHENTICATED: "Sessiyanın müddəti bitib. Yenidən daxil olun.",
  FORBIDDEN: "Bu bölməyə yalnız administratorlar daxil ola bilər.",
  VALIDATION: "Məlumatları yoxlayın: e-poçt ünvanı düzgün formatda olmalıdır.",
  RATE_LIMITED: "Çox sayda cəhd edildi. Bir dəqiqə gözləyib yenidən yoxlayın.",
  UNAVAILABLE: "Xidmətə qoşulmaq alınmadı. Bir az sonra yenidən yoxlayın.",
};

export function authErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  return messages[code as ApiErrorCode] ?? messages.UNAVAILABLE;
}
