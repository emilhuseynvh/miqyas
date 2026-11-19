import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { unsubscribe } from "@/app/actions";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormNotice } from "@/components/auth/FormNotice";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Abunəlikdən çıx", robots: { index: false } };

export default function UnsubscribePage({ searchParams }: PageProps<"/icmal/abunelikden-cix">) {
  return (
    <Suspense fallback={null}>
      <Unsubscribe searchParams={searchParams} />
    </Suspense>
  );
}

async function Unsubscribe({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const result = typeof params.netice === "string" ? params.netice : undefined;

  if (result === "ok") {
    return (
      <AuthShell title="Abunəlikdən çıxdın." subtitle="Artıq gündəlik icmal göndərməyəcəyik.">
        <p className="text-center font-sans text-sm text-muted">
          Fikrini dəyişsən,{" "}
          <Link href="/icmal#abune" className="text-accent underline underline-offset-2">
            yenidən abunə ola bilərsən
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Gündəlik icmaldan çıxmaq istəyirsən?" subtitle="Bir kliklə abunəliyi dayandıra bilərsən.">
      {result && <FormNotice tone="error">Link etibarsızdır və ya köhnəlib. Məktubdakı ən son linkdən istifadə et.</FormNotice>}
      {token ? (
        <form action={unsubscribe} className="text-center">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" size="lg">
            Abunəlikdən çıx
          </Button>
        </form>
      ) : (
        !result && <FormNotice tone="error">Bu səhifəyə məktubdakı linklə daxil ol.</FormNotice>
      )}
    </AuthShell>
  );
}
