import { getMaterials } from "@/lib/data";
import { MaterialsClient } from "./_components/materials-client";

export default async function MaterialsPage() {
  const materials = await getMaterials();

  return <MaterialsClient initialMaterials={materials} />;
}
