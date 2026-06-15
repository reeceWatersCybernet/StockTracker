import Link from "next/link";
import type { Metadata } from "next";
import { CustomerForm } from "@/components/customer-form";
import { createCustomer } from "@/lib/customers/actions";

export const metadata: Metadata = { title: "Add customer · Cybernet Stock Tracker" };

export default function NewCustomerPage() {
  return (
    <main className="mx-auto w-full max-w-xl space-y-6 px-4 py-6">
      <div>
        <Link href="/customers" className="text-sm text-muted hover:text-brand">
          ← Customers
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-carbon">
          Add customer
        </h1>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <CustomerForm action={createCustomer} mode="create" />
      </div>
    </main>
  );
}
