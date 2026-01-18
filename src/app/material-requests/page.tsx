import { getMaterialRequests } from "@/lib/data";
import { MaterialRequestsClient } from "./_components/requests-client";

export default async function MaterialRequestsPage() {
  const requests = await getMaterialRequests();

  return <MaterialRequestsClient initialRequests={requests} />;
}
