import { SuppliersClient } from "./_components/suppliers-client";
import type { Supplier } from "@/lib/types";

async function getSuppliers(): Promise<Supplier[]> {
  try {
    // Server-side fetch for initial data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/suppliers`, {
      cache: 'no-store',
    });
    if (response.ok) {
      return response.json();
    }
    return [];
  } catch {
    return [];
  }
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return <SuppliersClient initialSuppliers={suppliers} />;
}
