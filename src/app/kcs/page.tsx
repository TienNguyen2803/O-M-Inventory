import { getInboundReceipts } from "@/lib/data";
import { KcsClient } from "./_components/kcs-client";

export default async function KcsPage() {
  const receipts = await getInboundReceipts();
  return <KcsClient initialReceipts={receipts} />;
}
