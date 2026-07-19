import { requireAdmin } from "@/lib/session";
import { getSchedule, getSettings } from "@/lib/content";
import ScheduleEditor from "@/components/admin/ScheduleEditor";

export default async function Page() {
  await requireAdmin();
  const [schedule, settings] = await Promise.all([getSchedule(), getSettings()]);
  return (
    <ScheduleEditor
      initial={schedule.map(({ day, time, activity, mode }) => ({ day, time, activity, mode }))}
      initialNote={settings.schedule_note ?? ""}
    />
  );
}
