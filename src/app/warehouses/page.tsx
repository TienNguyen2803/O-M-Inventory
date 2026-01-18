import { getWarehouseLocations } from "@/lib/data";
import { WarehousesClient } from "./_components/warehouses-client";

export default async function WarehousesPage() {
  const locations = await getWarehouseLocations();

  return <WarehousesClient initialLocations={locations} />;
}
