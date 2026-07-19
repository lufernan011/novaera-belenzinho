import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Fale Conosco",
  description:
    "Endereço, telefone, e-mail e horário da secretaria do Centro Espírita Nova Era — Rua Martim Affonso, 78, Belenzinho, São Paulo.",
};

export default async function Page() {
  const s = await getSettings();
  const phoneDigits = s.phone.replace(/\D/g, "");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${s.address_street}, ${s.address_district}, ${s.address_zip}`
  )}`;

  return (
    <PageShell
      title="Fale Conosco"
      image="/images/hero.jpg"
      intro="O Centro Espírita Nova Era é uma casa de apoio e esclarecimento físico e espiritual, sem fins lucrativos. Será um prazer receber você."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <section className="rounded-2xl border border-sand-200 bg-white p-6">
          <h2 className="mb-3 font-display text-2xl text-petrol-700">Onde estamos</h2>
          <p className="text-[17px] leading-relaxed">
            {s.address_street}
            <br />
            {s.address_district}
            <br />
            CEP {s.address_zip}
          </p>
          <a
            href={mapsUrl}
            rel="noopener"
            className="mt-4 inline-block rounded-full bg-petrol-700 px-6 py-3 text-[16px] text-white transition hover:bg-petrol-600"
          >
            Ver no mapa
          </a>
        </section>

        <section className="rounded-2xl border border-sand-200 bg-white p-6">
          <h2 className="mb-3 font-display text-2xl text-petrol-700">Contato</h2>
          <p className="text-[17px] leading-relaxed">
            Telefone:{" "}
            <a href={`tel:+55${phoneDigits}`} className="text-coral-600 hover:underline">
              {s.phone}
            </a>
            <br />
            E-mail:{" "}
            <a href={`mailto:${s.email}`} className="text-coral-600 hover:underline">
              {s.email.split("@")[0]}@<wbr />
              {s.email.split("@")[1]}
            </a>
          </p>
          {s.whatsapp && (
            <a
              href={`https://wa.me/55${s.whatsapp.replace(/\D/g, "")}`}
              rel="noopener"
              className="mt-4 inline-block rounded-full bg-amber-500 px-6 py-3 text-[16px] font-medium text-ink-900 transition hover:bg-amber-300"
            >
              Chamar no WhatsApp
            </a>
          )}
        </section>

        <section className="rounded-2xl border border-sand-200 bg-white p-6 sm:col-span-2">
          <h2 className="mb-3 font-display text-2xl text-petrol-700">
            Horário da secretaria
          </h2>
          <p className="text-[17px] leading-relaxed">{s.secretary_hours}</p>
        </section>
      </div>
    </PageShell>
  );
}
