import type { ReactNode } from "react";

type Props = {
  tone: "error" | "success";
  children: ReactNode;
};

const tones = {
  error: "border-signal bg-[#f6e2d6] text-[#7a3115]",
  success: "border-[#4f6b33] bg-[#e3ead4] text-[#34481f]",
};

export function FormNotice({ tone, children }: Props) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`mb-5 border-l-2 px-3 py-2 font-sans text-sm ${tones[tone]}`}>
      {children}
    </p>
  );
}
