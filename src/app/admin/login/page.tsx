import Image from "next/image";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getSession } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session.isAdmin) redirect("/admin/");

  const db = await getDb();
  const users: Array<{ id: number; name: string }> = await db
    .select({ id: schema.users.id, name: schema.users.name })
    .from(schema.users)
    .orderBy(asc(schema.users.name));

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-3xl border border-sand-200 bg-white p-8 text-center shadow-sm">
        <Image
          src="/acervo/2017_10_Logo_NovaEraBelenzinho.jpg"
          alt=""
          width={64}
          height={64}
          className="mx-auto h-16 w-16 rounded-full border-2 border-sand-200 object-cover object-left"
        />
        <h1 className="mt-4 font-display text-2xl text-petrol-700">
          Área da diretoria
        </h1>
        <p className="mt-1 text-[16px] text-ink-600">
          {users.length > 0
            ? "Escolha seu nome e digite sua senha."
            : "Digite a senha para entrar."}
        </p>
        <LoginForm users={users} />
      </div>
    </main>
  );
}
