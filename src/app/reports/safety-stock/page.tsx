import { getMaterials } from "@/lib/data";
import { SafetyStockReportClient } from "./_components/safety-stock-report-client";

export default async function SafetyStockReportPage() {
  const materials = await getMaterials();

  return <SafetyStockReportClient initialMaterials={materials} />;
}
