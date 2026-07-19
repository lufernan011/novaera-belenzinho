"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm({
  users,
}: {
  users: Array<{ id: number; name: string }>;
}) {
  const [state, action, pending] = useActionState(login, undefined);
  const [recovery, setRecovery] = useState(false);
  const withUsers = users.length > 0 && !recovery;

  return (
    <form action={action} className="mt-6 text-left">
      {withUsers ? (
        <>
          <label
            htmlFor="userId"
            className="mb-1.5 block text-[16px] font-medium text-twilight-700"
          >
            Quem é você?
          </label>
          <select
            id="userId"
            name="userId"
            required
            defaultValue=""
            className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3.5 text-[18px] text-ink-900 focus:border-coral-500"
          >
            <option value="" disabled>
              — escolha seu nome —
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </>
      ) : (
        <input type="hidden" name="userId" value="master" />
      )}

      <label
        htmlFor="pin"
        className="mb-1.5 mt-4 block text-[16px] font-medium text-twilight-700"
      >
        {withUsers ? "Sua senha" : "Senha mestre"}
      </label>
      <input
        id="pin"
        name="pin"
        type="password"
        autoComplete="current-password"
        required
        className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3.5 text-center text-2xl tracking-[0.35em] text-ink-900 focus:border-coral-500"
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

      {users.length > 0 && (
        <button
          type="button"
          onClick={() => setRecovery((v) => !v)}
          className="mt-4 w-full text-center text-[14px] text-ink-500 underline-offset-2 hover:text-coral-700 hover:underline"
        >
          {recovery ? "← Voltar à entrada normal" : "Esqueci minha senha (recuperação)"}
        </button>
      )}
    </form>
  );
}
