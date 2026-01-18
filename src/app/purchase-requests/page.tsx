import { getPurchaseRequests } from "@/lib/data";
import { PurchaseRequestsClient } from "./_components/purchase-requests-client";

export default async function PurchaseRequestsPage() {
  const requests = await getPurchaseRequests();

  return <PurchaseRequestsClient initialRequests={requests} />;
}
