import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/customer-form";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { updateCustomer, deleteCustomer } from "@/lib/customers/actions";

export const metadata: Metadata = { title: "Edit customer · Cybernet Stock Tracker" };

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { _count: { select: { movements: true } } },
  });
  if (!customer) notFound();

  const hasHistory = customer._count.movements > 0;

  return (
    <main className="mx-auto w-full max-w-xl space-y-6 px-4 py-6">
      <div>
        <Link href="/customers" className="text-sm text-muted hover:text-brand">
          ← Customers
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-carbon">
          Edit customer
        </h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <CustomerForm
          action={updateCustomer.bind(null, customer.id)}
          mode="edit"
          defaults={{
            name: customer.name,
            shortCode: customer.shortCode,
            isActive: customer.isActive,
          }}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-carbon">Delete customer</h2>
        {hasHistory ? (
          <p className="mt-1 text-sm text-muted">
            This customer appears in {customer._count.movements} movement
            {customer._count.movements === 1 ? "" : "s"}, so it can&rsquo;t be
            deleted without losing history. Untick &ldquo;Active&rdquo; above to
            hide it from the deploy list instead.
          </p>
        ) : (
          <div className="mt-2">
            <p className="mb-3 text-sm text-muted">
              This customer has no movement history and can be safely deleted.
            </p>
            <DeleteCustomerButton action={deleteCustomer.bind(null, customer.id)} />
          </div>
        )}
      </div>
    </main>
  );
}
