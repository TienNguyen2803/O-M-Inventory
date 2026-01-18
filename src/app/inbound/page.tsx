import { getInventoryLogs, getMaterials } from "@/lib/data";
import { InboundClient } from "./_components/inbound-client";

export default async function InboundPage() {
  const logs = (await getInventoryLogs()).filter((log) => log.type === "inbound");
  const materials = await getMaterials();

  return (
    <div className="flex-1 space-y-4 pt-6">
      <InboundClient
        initialLogs={logs}
        materials={materials}
      />
    </div>
  );
}
