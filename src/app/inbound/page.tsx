import { getInventoryLogs, getMaterials } from "@/lib/data";
import { InboundClient } from "./_components/inbound-client";

export default async function InboundPage() {
  const logs = (await getInventoryLogs()).filter((log) => log.type === "inbound");
  const materials = await getMaterials();

  return (
    <InboundClient
      initialLogs={logs}
      materials={materials}
    />
  );
}
