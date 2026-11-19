import type { Metadata } from "next";
import { Suspense } from "react";
import { adminLogin } from "./actions";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormNotice } from "@/components/auth/FormNotice";
import { TextField } from "@/components/auth/TextField";
import { Button } from "@/components/ui/Button";
import { authErrorMessage } from "@/lib/auth-messages";

export const metadata: Metadata = { title: "Admin girişi", robots: { index: false } };

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/giris">) {
  return (
    <AuthShell title="İdarəetmə panelinə giriş." subtitle="Yalnız redaksiya üçün.">
      <Suspense fallback={null}>
        <LoginError searchParams={searchParams} />
      </Suspense>
      <form action={adminLogin} className="flex flex-col gap-4">
        <TextField label="E-poçt ünvanı" name="email" type="email" autoComplete="username" required />
        <TextField label="Şifrə" name="password" type="password" autoComplete="current-password" required />
        <Button type="submit" size="lg" className="mt-2">
          Daxil ol
        </Button>
      </form>
    </AuthShell>
  );
}

async function LoginError({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { xeta } = await searchParams;
  const message = authErrorMessage(typeof xeta === "string" ? xeta : undefined);
  return message ? <FormNotice tone="error">{message}</FormNotice> : null;
}
