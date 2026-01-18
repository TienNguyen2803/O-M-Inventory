import { getInventoryLogs, getMaterials } from "@/lib/data";
import { InventoryReportClient } from "./_components/inventory-report-client";

export default async function InventoryReportPage() {
  const inventoryLogs = await getInventoryLogs();
  const materials = await getMaterials();

  return <InventoryReportClient initialLogs={inventoryLogs} materials={materials} />;
}
