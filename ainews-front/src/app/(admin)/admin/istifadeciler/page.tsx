import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { EmptyRow, Panel, Table, Td, Th } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-session";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "İstifadəçilər · Admin", robots: { index: false } };

const roleLabel = { admin: "Administrator", user: "İstifadəçi" } as const;

export default function UsersPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Users />
    </Suspense>
  );
}

async function Users() {
  const user = await requireAdmin();
  const users = await adminApi.users();

  return (
    <AdminShell user={user} section="users" title="İstifadəçilər" description={`${users.length} qeydiyyatlı hesab`}>
      <Panel flush>
        <Table
          head={
            <>
              <Th>Ad Soyad</Th>
              <Th>E-poçt</Th>
              <Th>Rol</Th>
              <Th>Qeydiyyat</Th>
            </>
          }
        >
          {users.length === 0 && <EmptyRow colSpan={4}>Hələ istifadəçi yoxdur.</EmptyRow>}
          {users.map((u) => (
            <tr key={u.id}>
              <Td className="font-medium">
                {u.firstName} {u.lastName}
              </Td>
              <Td className="text-ops-muted">{u.email}</Td>
              <Td>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.role === "admin" ? "bg-ops-accent/10 text-ops-accent" : "bg-ops-muted/10 text-ops-muted"
                  }`}
                >
                  {roleLabel[u.role]}
                </span>
              </Td>
              <Td className="whitespace-nowrap text-ops-muted">{formatDateTime(u.createdAt)}</Td>
            </tr>
          ))}
        </Table>
      </Panel>
    </AdminShell>
  );
}
