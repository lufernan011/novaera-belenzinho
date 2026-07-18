"use client";

import { useState } from "react";
import { savePeople, type PersonInput } from "@/app/admin/actions";
import { EditorHeader, PhotoInput, RowControls, SaveBar, inputCls } from "./ui";

export default function PeopleEditor({
  kind,
  title,
  hint,
  roleLabel,
  initial,
}: {
  kind: "board" | "president" | "worker";
  title: string;
  hint: string;
  roleLabel: string;
  initial: PersonInput[];
}) {
  const [items, setItems] = useState<PersonInput[]>(initial);

  function update(index: number, patch: Partial<PersonInput>) {
    setItems((l) => l.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function move(index: number, dir: -1 | 1) {
    setItems((l) => {
      const next = [...l];
      const j = index + dir;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <EditorHeader title={title} hint={hint} />
      <ul className="space-y-3">
        {items.map((p, i) => (
          <li key={i} className="rounded-2xl border border-sand-300 bg-white p-4">
            <div className="flex flex-wrap items-start gap-4">
              <PhotoInput value={p.photo} onChange={(url) => update(i, { photo: url })} />
              <div className="min-w-52 flex-1 space-y-2">
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="Nome completo"
                  className={inputCls}
                  aria-label="Nome"
                />
                <input
                  type="text"
                  value={p.role}
                  onChange={(e) => update(i, { role: e.target.value })}
                  placeholder={roleLabel}
                  className={inputCls}
                  aria-label={roleLabel}
                />
              </div>
              <RowControls
                onUp={i > 0 ? () => move(i, -1) : undefined}
                onDown={i < items.length - 1 ? () => move(i, 1) : undefined}
                onRemove={() => setItems((l) => l.filter((_, j) => j !== i))}
              />
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setItems((l) => [...l, { name: "", role: "", photo: "" }])}
        className="mt-3 rounded-xl border border-dashed border-sand-300 px-5 py-3 text-[16px] text-coral-700 hover:border-coral-500"
      >
        + Adicionar pessoa
      </button>
      <SaveBar
        entity={`people:${kind}`}
        onSave={() => savePeople(kind, items.filter((p) => p.name.trim()))}
        onUndone={() => window.location.reload()}
      />
    </main>
  );
}
