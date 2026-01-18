import { getStockTakes } from "@/lib/data";
import { StockTakeClient } from "./_components/stock-take-client";

export default async function StockTakePage() {
  const stockTakes = await getStockTakes();
  return <StockTakeClient initialStockTakes={stockTakes} />;
}
