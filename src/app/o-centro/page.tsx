import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "O Centro",
  description:
    "Conheça o Centro Espírita Nova Era: história, trabalhos realizados, presidentes, diretoria e trabalhadores voluntários.",
};

const SECTIONS = [
  {
    href: "/nossa-historia/",
    title: "Nossa história",
    text: "A caminhada da casa desde 1947: fundadores, sede própria, reformas e comemorações.",
    image: "/acervo/2017_10_inauguracao-sede-propria.jpg",
  },
  {
    href: "/trabalhos-realizados/",
    title: "Trabalhos realizados",
    text: "Assistência social, mediunidade, passes, estudos, costura e bazar.",
    image: "/acervo/2017_10_assistencia-social.jpg",
  },
  {
    href: "/presidentes/",
    title: "Presidentes",
    text: "As gestões que conduziram o Nova Era ao longo das décadas.",
    image: "/acervo/2017_12_presidencia-cortelazzo-lopes.jpg",
  },
  {
    href: "/diretoria/",
    title: "Diretoria",
    text: "O corpo diretivo atual da casa.",
    image: "/acervo/2017_10_reforma-concluida-1.jpg",
  },
  {
    href: "/trabalhadores/",
    title: "Trabalhadores",
    text: "Homenagem aos voluntários que fazem a casa acontecer.",
    image: "/acervo/2017_10_2005-encontro-trabalhadores-1.jpg",
  },
];

export default function Page() {
  return (
    <PageShell
      title="O Centro"
      image="/images/campo.jpg"
      intro="Conheça a história, as pessoas e os trabalhos do Centro Espírita Nova Era."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex gap-4 rounded-2xl border border-sand-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Image
              src={s.image}
              alt=""
              width={200}
              height={200}
              className="h-24 w-24 shrink-0 rounded-xl object-cover object-top"
            />
            <span>
              <span className="font-display text-xl text-petrol-700 group-hover:text-coral-600">
                {s.title}
              </span>
              <span className="mt-1 block text-[15px] leading-relaxed text-ink-600">
                {s.text}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
