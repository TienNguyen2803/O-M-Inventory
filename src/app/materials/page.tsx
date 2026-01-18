import { getMaterials } from "@/lib/data";
import { MaterialsClient } from "./_components/materials-client";

export default async function MaterialsPage() {
  const materials = await getMaterials();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 md:pt-6">
      <MaterialsClient initialMaterials={materials} />
    </div>
  );
}
