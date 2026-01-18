import { getRoles } from "@/lib/data";
import { RolesClient } from "./_components/roles-client";

export default async function RolesPage() {
  const roles = await getRoles();

  return <RolesClient initialRoles={roles} />;
}
