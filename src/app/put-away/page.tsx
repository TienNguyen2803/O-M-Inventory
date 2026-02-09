import { PutAwayClient } from "./_components/put-away-client";
import { getInboundReceipts, getWarehouseLocations } from "@/lib/data";

export default async function PutAwayPage() {
    const receipts = await getInboundReceipts();
    const locations = await getWarehouseLocations();
    return <PutAwayClient initialReceipts={receipts} allLocations={locations} />;
}
