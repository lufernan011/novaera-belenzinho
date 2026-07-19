import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getSession, requireAdmin } from "@/lib/session";
import { logout } from "./actions";

const ACTIONS = [
  { href: "/admin/horarios/", icon: "🕐", label: "Mudar horários" },
  { href: "/admin/contato/", icon: "📞", label: "Telefone e endereço" },
  { href: "/admin/diretoria/", icon: "👥", label: "Editar a diretoria" },
  { href: "/admin/presidentes/", icon: "🏛️", label: "Editar presidentes" },
  { href: "/admin/trabalhadores/", icon: "🤝", label: "Editar trabalhadores" },
  { href: "/admin/publicacoes/", icon: "✏️", label: "Publicações" },
  { href: "/admin/paginas/", icon: "📄", label: "Textos das páginas" },
  { href: "/admin/doacoes/", icon: "🎁", label: "Doações e PIX" },
  { href: "/admin/frases/", icon: "💬", label: "Frases da página inicial" },
  { href: "/admin/acessos/", icon: "🔑", label: "Quem tem acesso" },
];

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "ontem" : `há ${days} dias`;
}

export default async function AdminHome() {
  await requireAdmin();
  const session = await getSession();
  const db = await getDb();
  const recent: Array<typeof schema.revisions.$inferSelect> = await db
    .select()
    .from(schema.revisions)
    .orderBy(desc(schema.revisions.id))
    .limit(5);

  const firstName = (session.userName ?? "").split(" ")[0];

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-petrol-700">
            {firstName && firstName !== "Recuperação"
              ? `Olá, ${firstName}! O que você quer fazer?`
              : "Olá! O que você quer fazer?"}
          </h1>
          <p className="mt-2 text-[17px] text-ink-600">
            Toque em uma das opções abaixo. Tudo o que você salvar aparece no
            site na hora — e sempre dá para desfazer.
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-sand-300 bg-white px-5 py-2.5 text-[15px] text-ink-600 hover:border-coral-500"
          >
            Sair
          </button>
        </form>
      </div>

      {session.userName === "Recuperação" && (
        <p className="mb-6 rounded-xl border border-amber-500 bg-sand-100 px-5 py-4 text-[15px] text-ink-800">
          Você entrou com a senha mestre. Vá em{" "}
          <Link href="/admin/acessos/" className="text-coral-700 underline">
            Quem tem acesso
          </Link>{" "}
          para cadastrar as pessoas da diretoria.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex min-h-[130px] flex-col items-center justify-center gap-2 rounded-2xl border border-sand-300 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-coral-500 hover:shadow-md"
          >
            <span className="text-3xl" aria-hidden>
              {a.icon}
            </span>
            <span className="text-[17px] font-medium leading-snug text-petrol-700">
              {a.label}
            </span>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <section className="mt-8 rounded-xl border border-sand-300 bg-white px-5 py-4">
          <h2 className="mb-2 text-[14px] font-medium tracking-wide text-ink-500 uppercase">
            Últimas alterações
          </h2>
          <ul className="space-y-1.5 text-[15px] text-ink-600">
            {recent.map((r) => (
              <li key={r.id}>
                <span className="text-petrol-700">{r.label || r.entity}</span>
                {r.author && <> · {r.author}</>} · {timeAgo(r.createdAt)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-4 rounded-xl border border-sand-300 bg-white px-5 py-4 text-[15px] text-ink-600">
        Dica: se algo sair diferente do esperado, abra a mesma tela e toque em
        “Desfazer última alteração”. Nada se perde.
      </p>
    </main>
  );
}
