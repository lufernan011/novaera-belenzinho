"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-6">
      <label htmlFor="pin" className="sr-only">
        Senha
      </label>
      <input
        id="pin"
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="current-password"
        required
        autoFocus
        className="w-full rounded-xl border border-sand-300 bg-white px-4 py-4 text-center text-3xl tracking-[0.5em] text-ink-900 focus:border-coral-500"
      />
      {state?.error && (
        <p role="alert" className="mt-3 text-[15px] text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-full bg-amber-500 px-8 py-4 text-lg font-medium text-ink-900 transition hover:bg-amber-300 disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
