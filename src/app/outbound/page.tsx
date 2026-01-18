import { getOutboundVouchers } from "@/lib/data";
import { OutboundClient } from "./_components/outbound-client";

export default async function OutboundPage() {
  const vouchers = await getOutboundVouchers();

  return <OutboundClient initialVouchers={vouchers} />;
}
