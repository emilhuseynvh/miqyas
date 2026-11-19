import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { completeRegistration } from "../actions";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormNotice } from "@/components/auth/FormNotice";
import { TextField } from "@/components/auth/TextField";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { ApiError, authApi, type VerifyLinkResponse } from "@/lib/api";

export const metadata: Metadata = { title: "Hesabı tamamla", robots: { index: false, follow: false } };

const validationMessage = "Ad və soyad boş ola bilməz, hər biri ən çox 100 simvol olmalıdır.";

export default function CompleteRegistrationPage({ searchParams }: PageProps<"/hesab/tamamla">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CompleteRegistrationContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CompleteRegistrationContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  if (!token) redirect("/hesab?xeta=INVALID_LINK");

  let result: VerifyLinkResponse;
  try {
    result = await authApi.verify(token);
  } catch (error) {
    redirect(`/hesab?xeta=${error instanceof ApiError ? error.code : "UNAVAILABLE"}`);
  }
  if (result.status !== "registration_required") redirect("/hesab");

  const error = params.xeta === "VALIDATION" ? validationMessage : null;

  return (
    <AuthShell title="Az qaldı. Özünü təqdim et." subtitle={result.email}>
      {error && <FormNotice tone="error">{error}</FormNotice>}
      <form action={completeRegistration} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Ad" name="firstName" autoComplete="given-name" required maxLength={100} autoFocus />
          <TextField label="Soyad" name="lastName" autoComplete="family-name" required maxLength={100} />
        </div>
        <Button type="submit" size="lg" className="mt-2">
          Hesabı yarat
        </Button>
      </form>
    </AuthShell>
  );
}
