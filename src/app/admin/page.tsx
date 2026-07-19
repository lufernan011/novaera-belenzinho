import Link from "next/link";
import { getSession, requireAdmin } from "@/lib/session";
import { getRecentRevisions } from "@/lib/history";
import HistoryList from "@/components/admin/HistoryList";
import { logout } from "./actions";

const GROUPS = [
  {
    title: "Dia a dia",
    items: [
      { href: "/admin/horarios/", icon: "🕐", label: "Horários" },
      { href: "/admin/publicacoes/", icon: "✏️", label: "Publicações" },
    ],
  },
  {
    title: "Pessoas da casa",
    items: [
      { href: "/admin/diretoria/", icon: "👥", label: "Diretoria" },
      { href: "/admin/presidentes/", icon: "🏛️", label: "Presidentes" },
      { href: "/admin/trabalhadores/", icon: "🤝", label: "Trabalhadores" },
    ],
  },
  {
    title: "Informações do site",
    items: [
      { href: "/admin/contato/", icon: "📞", label: "Telefone e endereço" },
      { href: "/admin/doacoes/", icon: "🎁", label: "Doações e PIX" },
      { href: "/admin/frases/", icon: "💬", label: "Frases da página inicial" },
      { href: "/admin/paginas/", icon: "📄", label: "Textos das páginas" },
    ],
  },
  {
    title: "Administração",
    items: [
      { href: "/admin/acessos/", icon: "🔑", label: "Quem tem acesso" },
      { href: "/admin/historico/", icon: "🕰️", label: "Histórico de alterações" },
    ],
  },
];

export default async function AdminHome() {
  await requireAdmin();
  const session = await getSession();
  const recent = await getRecentRevisions(5);
  const firstName = (session.userName ?? "").split(" ")[0];
  const isMaster = session.userName === "Senha mestre";

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-petrol-700">
            {firstName && !isMaster
              ? `Olá, ${firstName}! O que você quer fazer?`
              : "Olá! O que você quer fazer?"}
          </h1>
          <p className="mt-2 text-[17px] text-ink-600">
            Tudo o que você salvar aparece no site na hora — e sempre dá para
            desfazer.
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

      {isMaster && (
        <p className="mb-6 rounded-xl border border-amber-500 bg-sand-100 px-5 py-4 text-[15px] text-ink-800">
          Você entrou com a senha mestre. Vá em{" "}
          <Link href="/admin/acessos/" className="text-coral-700 underline">
            Quem tem acesso
          </Link>{" "}
          para cadastrar as pessoas da diretoria — assim cada alteração fica
          registrada com o nome de quem fez.
        </p>
      )}

      <div className="space-y-8">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-[13px] font-medium tracking-[0.15em] text-ink-500 uppercase">
              {group.title}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {group.items.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-sand-300 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-coral-500 hover:shadow-md"
                >
                  <span className="text-3xl" aria-hidden>
                    {a.icon}
                  </span>
                  <span className="text-[16px] font-medium leading-snug text-petrol-700">
                    {a.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {recent.length > 0 && (
        <section className="mt-10 rounded-2xl border border-sand-300 bg-white px-5 py-4">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[13px] font-medium tracking-[0.15em] text-ink-500 uppercase">
              Últimas alterações
            </h2>
            <Link
              href="/admin/historico/"
              className="text-[14px] text-coral-700 hover:underline"
            >
              ver tudo →
            </Link>
          </div>
          <HistoryList rows={recent} />
        </section>
      )}
    </main>
  );
}
