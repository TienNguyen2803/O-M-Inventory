import { getOutboundVouchers } from "@/lib/data";
import { PickingClient } from "./_components/picking-client";

export default async function PickingPage() {
    const vouchers = await getOutboundVouchers();
    return <PickingClient initialVouchers={vouchers} />;
}
