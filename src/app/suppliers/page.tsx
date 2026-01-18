import { getSuppliers } from "@/lib/data";
import { SuppliersClient } from "./_components/suppliers-client";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return <SuppliersClient initialSuppliers={suppliers} />;
}
