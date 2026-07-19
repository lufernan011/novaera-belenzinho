import Link from "next/link";
import { DAY_NAMES, getSchedule, todayInSaoPaulo } from "@/lib/content";

/**
 * Destaque "Hoje no Nova Era" da home: cartão sobreposto ao hero com as
 * atividades do dia — ou as do próximo dia com atividades.
 */
export default async function TodayCard() {
  const [schedule, today] = [await getSchedule(), todayInSaoPaulo()];

  let day = today;
  let label = "Hoje";
  for (let offset = 0; offset <= 6; offset++) {
    const candidate = (today + offset) % 7;
    if (schedule.some((s) => s.day === candidate)) {
      day = candidate;
      label = offset === 0 ? "Hoje" : offset === 1 ? "Amanhã" : "Próxima atividade";
      break;
    }
  }
  const items = schedule.filter((s) => s.day === day);

  return (
    <div className="relative z-10 mx-auto -mt-14 w-full max-w-4xl px-5">
      <section
        aria-label="Atividades do dia"
        className="rounded-3xl border border-sand-200 bg-white p-6 shadow-lg sm:p-8"
      >
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl text-petrol-700">
            {label}, {DAY_NAMES[day].toLowerCase()}
            {items.every((i) => i.mode === "online") && (
              <span className="ml-3 rounded-full bg-petrol-100 px-3 py-1 align-middle text-[13px] font-sans text-petrol-700">
                online
              </span>
            )}
          </h2>
          <Link
            href="/horarios/"
            className="rounded-full border border-sand-300 px-5 py-2.5 text-[15px] text-petrol-700 transition hover:border-coral-500"
          >
            Semana completa →
          </Link>
        </div>
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-baseline gap-3">
              <span className="font-display text-2xl text-coral-600 tabular-nums">
                {item.time}
              </span>
              <span className="text-[17px] leading-snug text-ink-800">
                {item.activity}
                {item.mode === "online" && items.some((i) => i.mode !== "online") && (
                  <span className="text-coral-600"> · online</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
