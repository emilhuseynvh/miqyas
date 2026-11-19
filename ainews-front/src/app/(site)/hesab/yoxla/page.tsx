import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getPendingEmail } from "@/lib/session";

export const metadata: Metadata = { title: "E-poçtunu yoxla", robots: { index: false, follow: false } };

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CheckEmailContent />
    </Suspense>
  );
}

async function CheckEmailContent() {
  const email = await getPendingEmail();

  return (
    <AuthShell title="E-poçtunu yoxla." subtitle="Giriş linkini göndərdik.">
      <p className="text-center font-serif text-lg leading-snug">
        {email ? (
          <>
            <span className="font-semibold">{email}</span> ünvanına göndərilən linkə klikləyərək davam et.
          </>
        ) : (
          "Daxil etdiyin ünvana göndərilən linkə klikləyərək davam et."
        )}
      </p>
      <p className="mt-6 text-center font-sans text-xs leading-relaxed text-muted">
        Link 15 dəqiqə etibarlıdır. Məktub gəlmədisə, spam qovluğunu yoxla və ya{" "}
        <Link href="/hesab" className="text-accent underline underline-offset-2">
          yeni link istə
        </Link>
        .
      </p>
    </AuthShell>
  );
}
