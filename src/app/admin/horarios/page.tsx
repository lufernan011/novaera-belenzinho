import { requireAdmin } from "@/lib/session";
import { getSchedule } from "@/lib/content";
import ScheduleEditor from "@/components/admin/ScheduleEditor";

export default async function Page() {
  await requireAdmin();
  const schedule = await getSchedule();
  return (
    <ScheduleEditor
      initial={schedule.map(({ day, time, activity, mode }) => ({ day, time, activity, mode }))}
    />
  );
}
