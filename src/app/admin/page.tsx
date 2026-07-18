import Link from "next/link";
import { requireAdmin } from "@/lib/session";
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
];

export default async function AdminHome() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-twilight-700">
            Olá! O que você quer fazer?
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
            <span className="text-[17px] font-medium leading-snug text-twilight-700">
              {a.label}
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 rounded-xl border border-sand-300 bg-white px-5 py-4 text-[15px] text-ink-600">
        Dica: se algo sair diferente do esperado, abra a mesma tela e toque em
        “Desfazer última alteração”. Nada se perde.
      </p>
    </main>
  );
}
