import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import Blocks from "@/components/Blocks";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Espiritismo",
  description:
    "O que é o Espiritismo, quem foi Allan Kardec e onde estudar a doutrina espírita. Conheça os fundamentos com o Centro Espírita Nova Era, no Belenzinho, São Paulo.",
};

/** Citação do banner clássico do site antigo — preservada como texto. */
const KARDEC_QUOTE =
  "Antes de fazer a coisa para os homens, é preciso formar os homens para a coisa, como se formam obreiros antes de lhes confiar um trabalho.";

export default async function Page() {
  const page = await getPage("espiritismo");
  if (!page) notFound();
  const blocks = page.blocks.filter(
    (b, i) => !(i < 2 && b.type !== "image" && b.text.trim().toLowerCase() === "espiritismo")
  );

  return (
    <PageShell title="Espiritismo" image="/acervo/2017_10_espiritismo.jpg">
      <figure className="mb-10 flex flex-col items-center gap-6 rounded-3xl border border-sand-200 bg-white p-7 sm:flex-row sm:p-9">
        <Image
          src="/acervo/2017_10_alan_kardec.jpg"
          alt="Retrato de Allan Kardec"
          width={280}
          height={340}
          className="w-40 shrink-0 rounded-2xl border border-sand-200 sm:w-44"
        />
        <blockquote className="text-center sm:text-left">
          <p className="font-display text-xl leading-relaxed text-petrol-700 sm:text-2xl">
            “{KARDEC_QUOTE}”
          </p>
          <figcaption className="mt-4 font-display text-lg italic text-coral-600">
            — Allan Kardec
          </figcaption>
        </blockquote>
      </figure>
      <Blocks blocks={blocks} />
    </PageShell>
  );
}
