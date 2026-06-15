import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LocationType } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Customers · Cybernet Stock Tracker" };

export default async function CustomersPage() {
  const [customers, deployed] = await Promise.all([
    prisma.customer.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] }),
    prisma.movement.groupBy({
      by: ["customerId"],
      where: {
        isCurrent: true,
        locationType: LocationType.Customer,
        customerId: { not: null },
      },
      _count: { _all: true },
    }),
  ]);

  const deployedByCustomer = new Map(
    deployed.map((d) => [d.customerId, d._count._all]),
  );

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-carbon">Customers</h1>
          <p className="text-sm text-muted">
            {customers.length} {customers.length === 1 ? "customer" : "customers"}
          </p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex h-10 shrink-0 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Add customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">
          No customers yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {customers.map((c) => {
            const count = deployedByCustomer.get(c.id) ?? 0;
            return (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-carbon">{c.name}</span>
                    {c.shortCode && (
                      <span className="rounded bg-silver px-1.5 py-0.5 text-xs font-medium text-carbon">
                        {c.shortCode}
                      </span>
                    )}
                    {!c.isActive && (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-border">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {count} {count === 1 ? "device" : "devices"} currently deployed
                  </p>
                </div>
                <Link
                  href={`/customers/${c.id}/edit`}
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-carbon hover:bg-silver"
                >
                  Edit
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
