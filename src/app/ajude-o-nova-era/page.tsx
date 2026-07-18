import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = { title: "Ajude o Nova Era" };

const WAYS = [
  {
    title: "Doações de alimentos",
    text: "Leite em pó, arroz, feijão, óleo e outros não perecíveis para as cestas básicas das famílias assistidas.",
  },
  {
    title: "Doações para o bazar",
    text: "Roupas, calçados, brinquedos e itens de casa. A renda do bazar ajuda a manter a instituição.",
  },
  {
    title: "Seja contribuinte",
    text: "Associe-se com qualquer valor mensal, entregue na secretaria do Centro.",
  },
  {
    title: "Trabalho voluntário",
    text: "Doe seu tempo e talento em um dos nossos trabalhos. Procure a secretaria para conversar.",
  },
  {
    title: "Eventos beneficentes",
    text: "Participe das festas e eventos da casa — diversão que vira ajuda.",
  },
];

export default async function Page() {
  const s = await getSettings();

  return (
    <PageShell
      title="Ajude o Nova Era"
      intro="Toda ajuda se transforma em amparo às famílias assistidas e na manutenção da casa. Gratidão!"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {WAYS.map((w) => (
          <section key={w.title} className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="mb-2 font-display text-xl text-twilight-700">{w.title}</h2>
            <p className="text-[16px] leading-relaxed text-ink-600">{w.text}</p>
          </section>
        ))}

        <section className="rounded-2xl border-2 border-amber-500 bg-sand-100 p-6">
          <h2 className="mb-2 font-display text-xl text-twilight-700">
            Doação em dinheiro
          </h2>
          {s.donation_pix ? (
            <p className="mb-3 text-[17px]">
              <span className="font-medium">PIX:</span>{" "}
              <span className="rounded bg-white px-2 py-0.5">{s.donation_pix}</span>
            </p>
          ) : null}
          <p className="text-[16px] leading-relaxed">
            {s.donation_bank} · Agência {s.donation_agency}
            <br />
            Conta corrente {s.donation_account}
            <br />
            {s.donation_holder}
            <br />
            CNPJ {s.donation_cnpj}
          </p>
        </section>
      </div>
    </PageShell>
  );
}
