import { getMaterials, getInventoryLogs } from "@/lib/data";
import { SlowMovingReportClient } from "./_components/slow-moving-report-client";

export default async function SlowMovingReportPage() {
  const materials = await getMaterials();
  const logs = await getInventoryLogs();

  return <SlowMovingReportClient initialMaterials={materials} initialLogs={logs} />;
}
