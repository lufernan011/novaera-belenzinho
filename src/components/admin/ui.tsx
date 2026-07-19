"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import type { SaveResult } from "@/app/admin/actions";
import { undo } from "@/app/admin/actions";

/** Cabeçalho das telas de edição: voltar + título + dica. */
export function EditorHeader({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <header className="mb-6">
      <Link
        href="/admin/"
        className="mb-4 inline-flex items-center gap-2 text-[16px] text-coral-700 hover:underline"
      >
        <span aria-hidden>←</span> Voltar ao painel
      </Link>
      <h1 className="font-display text-3xl text-petrol-700">{title}</h1>
      {hint && <p className="mt-2 max-w-2xl text-[16px] text-ink-600">{hint}</p>}
    </header>
  );
}

/**
 * Barra de salvar: botão grande, mensagem "Pronto! Já está no ar." e
 * Desfazer. Fica grudada no rodapé da tela para estar sempre à mão.
 */
export function SaveBar({
  onSave,
  entity,
  onUndone,
}: {
  onSave: () => Promise<SaveResult>;
  entity: string;
  onUndone?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<SaveResult | null>(null);

  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-8 border-t border-sand-300 bg-sand-50/95 px-5 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setMessage(await onSave());
            })
          }
          className="rounded-full bg-amber-500 px-9 py-3.5 text-lg font-medium text-ink-900 transition hover:bg-amber-300 disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        <span
          aria-live="polite"
          className={`text-[16px] ${
            message ? (message.ok ? "text-green-800" : "text-red-700") : "text-transparent"
          }`}
        >
          {message ? (message.ok ? `✓ ${message.message}` : message.message) : "."}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const r = await undo(entity);
              setMessage(r);
              if (r.ok) onUndone?.();
            })
          }
          className="ml-auto text-[15px] text-ink-500 underline-offset-2 hover:text-coral-700 hover:underline"
        >
          Desfazer última alteração
        </button>
      </div>
    </div>
  );
}

/** Campo de foto: mostra a atual e permite trocar (upload). */
export function PhotoInput({
  value,
  onChange,
  label = "Foto",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/admin/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha no envio");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no envio da foto");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <Image
          src={value}
          alt=""
          width={96}
          height={96}
          unoptimized
          className="h-20 w-20 rounded-xl border border-sand-300 object-cover object-top"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-sand-300 bg-white text-2xl text-ink-500">
          ?
        </div>
      )}
      <div>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="rounded-full border border-sand-300 bg-white px-4 py-2 text-[15px] text-ink-800 hover:border-coral-500 disabled:opacity-50"
        >
          {busy ? "Enviando…" : value ? `Trocar ${label.toLowerCase()}` : `Escolher ${label.toLowerCase()}`}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-2 text-[14px] text-ink-500 hover:text-red-700"
          >
            remover
          </button>
        )}
        {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Botõezinhos de subir/descer/remover usados nas listas. */
export function RowControls({
  onUp,
  onDown,
  onRemove,
}: {
  onUp?: () => void;
  onDown?: () => void;
  onRemove: () => void;
}) {
  const btn =
    "rounded-lg border border-sand-300 bg-white px-2.5 py-1.5 text-[15px] leading-none text-ink-600 hover:border-coral-500 disabled:opacity-30";
  return (
    <div className="flex shrink-0 gap-1.5">
      <button type="button" className={btn} onClick={onUp} disabled={!onUp} aria-label="Mover para cima">
        ↑
      </button>
      <button type="button" className={btn} onClick={onDown} disabled={!onDown} aria-label="Mover para baixo">
        ↓
      </button>
      <button
        type="button"
        className={`${btn} text-red-700 hover:border-red-400`}
        onClick={onRemove}
        aria-label="Remover"
      >
        ✕
      </button>
    </div>
  );
}

export const inputCls =
  "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-[17px] text-ink-900 placeholder:text-ink-500/60 focus:border-coral-500";
