import { QuickIssueClient } from "./_components/quick-issue-client";
import { getMaterials, getWarehouseLocations } from "@/lib/data";

export default async function QuickIssuePage() {
  const materials = await getMaterials();
  const locations = await getWarehouseLocations();
  return <QuickIssueClient materials={materials} locations={locations} />;
}
