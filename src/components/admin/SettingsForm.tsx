"use client";

import { useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { EditorHeader, SaveBar, inputCls } from "./ui";

export type FieldDef = {
  key: string;
  label: string;
  help?: string;
  multiline?: boolean;
};

/** Formulário genérico de configurações (contato, doações, frases). */
export default function SettingsForm({
  title,
  hint,
  label,
  fields,
  initial,
}: {
  title: string;
  hint: string;
  label: string;
  fields: FieldDef[];
  initial: Record<string, string>;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, initial[f.key] ?? ""]))
  );

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <EditorHeader title={title} hint={hint} />
      <div className="space-y-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="mb-1.5 block text-[16px] font-medium text-petrol-700">
              {f.label}
            </label>
            {f.multiline ? (
              <textarea
                id={f.key}
                rows={3}
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className={inputCls}
              />
            ) : (
              <input
                id={f.key}
                type="text"
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className={inputCls}
              />
            )}
            {f.help && <p className="mt-1 text-[14px] text-ink-500">{f.help}</p>}
          </div>
        ))}
      </div>
      <SaveBar
        entity="settings"
        onSave={() => saveSettings(values, label)}
        onUndone={() => window.location.reload()}
      />
    </main>
  );
}
