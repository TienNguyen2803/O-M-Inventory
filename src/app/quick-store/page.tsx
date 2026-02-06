import { QuickStoreClient } from "./_components/quick-store-client";
import { getMaterials, getWarehouseLocations } from "@/lib/data";

export default async function QuickStorePage() {
  const materials = await getMaterials();
  const locations = await getWarehouseLocations();
  return <QuickStoreClient materials={materials} locations={locations} />;
}
