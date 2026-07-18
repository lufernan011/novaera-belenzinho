import Link from "next/link";
import { DAY_NAMES, getSchedule, todayInSaoPaulo } from "@/lib/content";

/** Faixa "Hoje no Nova Era": atividades do dia atual, direto do banco. */
export default async function TodayStrip() {
  const [schedule, today] = [await getSchedule(), todayInSaoPaulo()];
  const items = schedule.filter((s) => s.day === today);
  const dayLabel = DAY_NAMES[today].toLowerCase();

  return (
    <div className="border-b border-sand-200 bg-sand-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
        <span className="text-[15px] font-medium text-coral-700">
          Hoje, {dayLabel}
        </span>
        {items.length === 0 ? (
          <span className="text-[15px] text-ink-600">
            não há atividades — <Link href="/horarios/" className="underline hover:text-coral-700">veja a semana completa</Link>
          </span>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
