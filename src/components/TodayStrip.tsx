import Link from "next/link";
import { DAY_NAMES, getSchedule, nextActiveDay } from "@/lib/content";

/**
 * Faixa das páginas internas: atividades de hoje — ou, em dia sem
 * atividades, as do próximo dia com agenda (mesma lógica da home).
 */
export default async function TodayStrip() {
  const schedule = await getSchedule();
  const { day, label, items } = nextActiveDay(schedule);

  return (
    <div className="border-b border-sand-200 bg-sand-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
        <span className="text-[15px] font-medium text-coral-700">
          {label}, {DAY_NAMES[day].toLowerCase()}
        </span>
        {items.map((item) => (
          <span
            key={item.id}
            className="rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-sm text-ink-800"
          >
            {item.time} {item.activity}
            {item.mode === "online" && (
              <span className="ml-1.5 text-coral-600">· online</span>
            )}
          </span>
        ))}
        <Link
          href="/horarios/"
          className="text-sm text-coral-700 underline-offset-2 hover:underline"
        >
          semana completa →
        </Link>
      </div>
    </div>
  );
}
