import { PutAwayClient } from "./_components/put-away-client";
import { getPutAwayTasks } from "@/lib/data";

export default async function PutAwayPage() {
    const tasks = await getPutAwayTasks();
    return <PutAwayClient initialTasks={tasks} />;
}
