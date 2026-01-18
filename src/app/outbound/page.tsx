import { getInventoryLogs, getMaterials } from "@/lib/data";
import { OutboundClient } from "./_components/outbound-client";

export default async function OutboundPage() {
  const logs = (await getInventoryLogs()).filter(
    (log) => log.type === "outbound"
  );
  const materials = await getMaterials();

  return <OutboundClient initialLogs={logs} materials={materials} />;
}
