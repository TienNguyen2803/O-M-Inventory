import { getMasterDataCategories } from "@/lib/data";
import { OtherCategoriesClient } from "./_components/other-categories-client";

export default async function OtherCategoriesPage() {
  const categories = await getMasterDataCategories();
  return <OtherCategoriesClient initialCategories={categories} />;
}
