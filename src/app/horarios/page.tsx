import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { DAY_NAMES, getSchedule, getSettings, todayInSaoPaulo } from "@/lib/content";

export const metadata: Metadata = { title: "Horários" };

export default async function Page() {
  const [schedule, settings] = await Promise.all([getSchedule(), getSettings()]);
  const today = todayInSaoPaulo();
  const days = [1, 2, 3, 4, 5, 6, 0]
    .map((day) => ({ day, items: schedule.filter((s) => s.day === day) }))
    .filter((d) => d.items.length > 0);

  return (
    <PageShell
      title="Horários"
      image="/images/relogio.jpg"
      intro="Nossas atividades regulares, presenciais e online. Chegue alguns minutos antes — será muito bem-vindo."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {days.map(({ day, items }) => {
          const isToday = day === today;
          const online = items.every((i) => i.mode === "online");
          return (
            <section
              key={day}
              className={`rounded-2xl border p-5 ${
                isToday
                  ? "border-amber-500 bg-sand-100 shadow-md"
                  : "border-sand-200 bg-white"
              }`}
            >
              <header className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-display text-xl text-petrol-700">
                  {DAY_NAMES[day]}
                </h2>
                <div className="flex gap-1.5">
                  {isToday && (
                    <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-medium text-ink-900">
                      hoje
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      online
                        ? "bg-petrol-100 text-petrol-700"
                        : "bg-sand-200 text-coral-700"
                    }`}
                  >
                    {online ? "online" : "presencial"}
                  </span>
                </div>
              </header>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.id} className="flex items-baseline gap-3">
                    <span className="min-w-[52px] font-medium text-coral-600 tabular-nums">
                      {item.time}
                    </span>
                    <span className="text-[16px] text-ink-800">{item.activity}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {settings.schedule_note?.trim() && (
        <p className="mt-8 rounded-xl border border-sand-200 bg-sand-100 px-5 py-4 text-[15px] text-ink-600">
          {settings.schedule_note}
        </p>
      )}
    </PageShell>
  );
}
