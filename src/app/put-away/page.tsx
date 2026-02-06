import { PutAwayClient } from "./_components/put-away-client";
import { getInboundReceipts } from "@/lib/data";

export default async function PutAwayPage() {
    const receipts = await getInboundReceipts();
    return <PutAwayClient initialReceipts={receipts} />;
}
