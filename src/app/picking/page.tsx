import { getOutboundVouchers, getWarehouseLocations } from "@/lib/data";
import { PickingClient } from "./_components/picking-client";

export default async function PickingPage() {
    const vouchers = await getOutboundVouchers();
    const locations = await getWarehouseLocations();
    return <PickingClient initialVouchers={vouchers} allLocations={locations} />;
}
