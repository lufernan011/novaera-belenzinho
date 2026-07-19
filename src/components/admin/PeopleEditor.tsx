"use client";

import { useState } from "react";
import { savePeople, type PersonInput } from "@/app/admin/actions";
import { BOARD_GROUPS, boardGroup, workerTags } from "@/lib/people";
import { EditorHeader, PhotoInput, RowControls, SaveBar, inputCls } from "./ui";

/** Mostra onde a pessoa vai aparecer no site, conforme o cargo digitado. */
function SitePreviewHint({
  kind,
  role,
}: {
  kind: "board" | "president" | "worker";
  role: string;
}) {
  if (kind === "president") return null;
  const chipCls =
    "rounded-full bg-sand-100 border border-sand-300 px-2.5 py-0.5 text-[13px] text-coral-700";
  if (kind === "board") {
    const label = BOARD_GROUPS.find((g) => g.key === boardGroup(role))!.label;
    return (
      <p className="mt-1.5 text-[13px] text-ink-500">
        No site, aparece no grupo: <span className={chipCls}>{label}</span>
      </p>
    );
  }
  const tags = workerTags(role);
  if (tags.length === 0) return null;
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-500">
      Entra nos filtros:
      {tags.map((t) => (
        <span key={t} className={chipCls}>
          {t}
        </span>
      ))}
    </p>
  );
}

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
                <SitePreviewHint kind={kind} role={p.role} />
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
