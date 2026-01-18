import { getUsers } from "@/lib/data";
import { UsersClient } from "./_components/users-client";

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersClient initialUsers={users} />;
}
