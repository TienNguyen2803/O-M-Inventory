import { getBiddingPackages } from "@/lib/data";
import { BiddingsClient } from "./_components/biddings-client";

export default async function BiddingsPage() {
  const biddings = await getBiddingPackages();

  return <BiddingsClient initialBiddings={biddings} />;
}
