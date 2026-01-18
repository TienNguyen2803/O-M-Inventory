import { getActivityLogs } from "@/lib/data";
import { ActivityLogClient } from "./_components/activity-log-client";

export default async function ActivityLogPage() {
  const logs = await getActivityLogs();
  const users = [...new Set(logs.map(log => log.user.name))];
  return <ActivityLogClient initialLogs={logs} users={users} />;
}
