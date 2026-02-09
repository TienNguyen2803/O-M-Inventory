import { StockTakeScanClient } from "./_components/stock-take-scan-client";
import { getMaterials, getWarehouseLocations } from "@/lib/data";

export default async function StockTakeScanPage() {
  const materials = await getMaterials();
  const locations = await getWarehouseLocations();
  return <StockTakeScanClient allMaterials={materials} allLocations={locations} />;
}
