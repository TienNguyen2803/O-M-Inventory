import { getInboundReceipts } from "@/lib/data";
import { InboundClient } from "./_components/inbound-client";

export default async function InboundPage() {
  const receipts = await getInboundReceipts();

  return <InboundClient initialReceipts={receipts} />;
}
