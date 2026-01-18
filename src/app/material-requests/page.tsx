import { getMaterialRequests, getMaterials } from "@/lib/data";
import { MaterialRequestsClient } from "./_components/requests-client";

export default async function MaterialRequestsPage() {
  const requests = await getMaterialRequests();
  const materials = await getMaterials();

  return <MaterialRequestsClient initialRequests={requests} materials={materials} />;
}
