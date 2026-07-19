"use client";

import { useState } from "react";
import { saveSchedule, type ScheduleInput } from "@/app/admin/actions";
import { DAY_NAMES } from "@/lib/content";
import { EditorHeader, RowControls, SaveBar, inputCls } from "./ui";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function ScheduleEditor({
  initial,
  initialNote,
}: {
  initial: ScheduleInput[];
  initialNote: string;
}) {
  const [items, setItems] = useState<ScheduleInput[]>(initial);
  const [note, setNote] = useState(initialNote);

  function update(index: number, patch: Partial<ScheduleInput>) {
    setItems((list) => list.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function move(index: number, dir: -1 | 1) {
    setItems((list) => {
      const next = [...list];
      const j = index + dir;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <EditorHeader
        title="Horários"
        hint="Mude, acrescente ou remova os horários de cada dia. É assim que vai aparecer no site."
      />

      {DAY_ORDER.map((day) => {
        const dayItems = items
          .map((item, index) => ({ item, index }))
          .filter(({ item }) => item.day === day);
        return (
          <section key={day} className="mb-6">
            <h2 className="mb-2 font-display text-xl text-petrol-700">
              {DAY_NAMES[day]}
            </h2>
            {dayItems.length === 0 && (
              <p className="mb-2 text-[15px] text-ink-500">Sem atividades neste dia.</p>
            )}
            <ul className="space-y-2">
              {dayItems.map(({ item, index }, pos) => (
                <li
                  key={index}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-sand-300 bg-white p-3"
                >
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) => update(index, { time: e.target.value })}
                    className="rounded-lg border border-sand-300 px-3 py-2.5 text-[17px] tabular-nums"
                    aria-label="Horário"
                  />
                  <input
                    type="text"
                    value={item.activity}
                    onChange={(e) => update(index, { activity: e.target.value })}
                    placeholder="Nome da atividade"
                    className={`${inputCls} min-w-40 flex-1`}
                    aria-label="Atividade"
                  />
                  <select
                    value={item.mode}
                    onChange={(e) => update(index, { mode: e.target.value })}
                    className="rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-[16px]"
                    aria-label="Presencial ou online"
                  >
                    <option value="presencial">presencial</option>
                    <option value="online">online</option>
                  </select>
                  <RowControls
                    onUp={pos > 0 ? () => move(index, -1) : undefined}
                    onDown={pos < dayItems.length - 1 ? () => move(index, 1) : undefined}
                    onRemove={() => setItems((l) => l.filter((_, i) => i !== index))}
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                setItems((l) => [...l, { day, time: "20:00", activity: "", mode: "presencial" }])
              }
              className="mt-2 rounded-xl border border-dashed border-sand-300 px-4 py-2.5 text-[15px] text-coral-700 hover:border-coral-500"
            >
              + Adicionar horário em {DAY_NAMES[day].toLowerCase()}
            </button>
          </section>
        );
      })}

      <section className="mt-2">
        <label htmlFor="schedule-note" className="mb-1.5 block font-display text-xl text-petrol-700">
          Aviso no fim da página
        </label>
        <textarea
          id="schedule-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex.: Psicografia: primeira quinta-feira do mês, às 20h…"
          className={inputCls}
        />
        <p className="mt-1 text-[14px] text-ink-500">
          Aparece numa caixinha no fim da página de Horários. Deixe vazio para
          não mostrar aviso nenhum.
        </p>
      </section>

      <SaveBar
        entity="schedule"
        onSave={() =>
          saveSchedule(items.filter((i) => i.activity.trim() && i.time), note.trim())
        }
        onUndone={() => window.location.reload()}
      />
    </main>
  );
}
