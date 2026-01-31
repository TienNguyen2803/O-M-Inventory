import { getMaterials } from "@/lib/data";
import { MaterialRequestsClient } from "./_components/requests-client";

export default async function MaterialRequestsPage() {
  const materials = await getMaterials();

  return <MaterialRequestsClient materials={materials} />;
}
