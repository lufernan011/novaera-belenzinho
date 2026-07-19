"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  changeUserPassword,
  createUser,
  deleteUser,
  type SaveResult,
} from "@/app/admin/actions";
import { EditorHeader, inputCls } from "./ui";

type UserRow = { id: number; name: string };

export default function AccessEditor({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<SaveResult | null>(null);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  function run(fn: () => Promise<SaveResult>) {
    startTransition(async () => {
      const r = await fn();
      setMessage(r);
      if (r.ok) router.refresh();
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <EditorHeader
        title="Quem tem acesso"
        hint="Cada pessoa entra com o próprio nome e senha, e o site registra quem fez cada alteração. Remova o acesso de quem saiu da diretoria."
      />

      <section className="rounded-2xl border border-sand-300 bg-white p-5">
        <h2 className="mb-3 font-display text-xl text-twilight-700">
          Cadastrar nova pessoa
        </h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome (ex.: Elisabete)"
            className={`${inputCls} min-w-44 flex-1`}
            aria-label="Nome"
          />
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Senha (mín. 4)"
            className={`${inputCls} w-44`}
            aria-label="Senha"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const r = await createUser(newName, newPassword);
                if (r.ok) {
                  setNewName("");
                  setNewPassword("");
                }
                return r;
              })
            }
            className="rounded-full bg-amber-500 px-6 py-3 text-[16px] font-medium text-ink-900 hover:bg-amber-300 disabled:opacity-50"
          >
            Cadastrar
          </button>
        </div>
        <p className="mt-2 text-[14px] text-ink-500">
          Combine a senha com a pessoa e anote com cuidado — ela pode ser
          trocada aqui a qualquer momento.
        </p>
      </section>

      <span aria-live="polite" className={`mt-4 block text-[16px] ${message ? (message.ok ? "text-green-800" : "text-red-700") : "hidden"}`}>
        {message ? (message.ok ? `✓ ${message.message}` : message.message) : ""}
      </span>

      <ul className="mt-6 space-y-3">
        {users.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            isSelf={u.id === currentUserId}
            pending={pending}
            onChangePassword={(pw) => run(() => changeUserPassword(u.id, pw))}
            onRemove={() => {
              if (confirm(`Remover o acesso de ${u.name}?`)) {
                run(() => deleteUser(u.id));
              }
            }}
          />
        ))}
      </ul>
      {users.length === 0 && (
        <p className="mt-6 rounded-xl border border-amber-500 bg-sand-100 px-5 py-4 text-[16px] text-ink-800">
          Ainda não há ninguém cadastrado. Você entrou com a senha mestre —
          cadastre acima as pessoas da diretoria (inclusive você).
        </p>
      )}
    </main>
  );
}

function UserCard({
  user,
  isSelf,
  pending,
  onChangePassword,
  onRemove,
}: {
  user: UserRow;
  isSelf: boolean;
  pending: boolean;
  onChangePassword: (pw: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <li className="rounded-2xl border border-sand-300 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-display text-lg text-twilight-700">
          {user.name}
          {isSelf && <span className="ml-2 text-[13px] text-coral-700">(você)</span>}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-full border border-sand-300 bg-white px-4 py-2 text-[14px] text-ink-600 hover:border-coral-500"
          >
            {editing ? "Cancelar" : "Trocar senha"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onRemove}
            className="rounded-full border border-sand-300 bg-white px-4 py-2 text-[14px] text-red-700 hover:border-red-400"
          >
            Remover acesso
          </button>
        </div>
      </div>
      {editing && (
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nova senha (mín. 4)"
            className={`${inputCls} w-52`}
            aria-label={`Nova senha de ${user.name}`}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              onChangePassword(password);
              setPassword("");
              setEditing(false);
            }}
            className="rounded-full bg-amber-500 px-5 py-2.5 text-[15px] font-medium text-ink-900 hover:bg-amber-300"
          >
            Salvar senha
          </button>
        </div>
      )}
    </li>
  );
}
