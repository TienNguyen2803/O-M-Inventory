import { QuickStoreClient } from "./_components/quick-store-client";
import { getMaterials, getWarehouseLocations, getInboundReceipts } from "@/lib/data";

export default async function QuickStorePage() {
  const materials = await getMaterials();
  const locations = await getWarehouseLocations();
  const receipts = await getInboundReceipts();
  return <QuickStoreClient materials={materials} locations={locations} initialReceipts={receipts} />;
}
