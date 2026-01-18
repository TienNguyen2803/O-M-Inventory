import { getWarehouseLocations } from "@/lib/data";
import { WarehousesClient } from "./_components/warehouses-client";

export default async function WarehousesPage() {
  const locations = await getWarehouseLocations();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 md:pt-6">
      <WarehousesClient initialLocations={locations} />
    </div>
  );
}
