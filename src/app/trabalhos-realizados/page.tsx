import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import type { Block } from "@/db/schema";
import { getPage } from "@/lib/content";

export const metadata: Metadata = { title: "Trabalhos Realizados" };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Section = {
  id: string;
  title: string;
  image?: string;
  /** blocos na ordem, já sem o heading da seção */
  blocks: Block[];
};

/** Divide os blocos da página em seções, uma por heading. */
function toSections(blocks: Block[]): Section[] {
  const sections: Section[] = [];
  for (const block of blocks) {
    if (block.type === "heading") {
      sections.push({ id: slugify(block.text), title: block.text, blocks: [] });
      continue;
    }
    const current = sections[sections.length - 1];
    if (!current) continue;
    if (block.type === "image" && !current.image) current.image = block.src;
    current.blocks.push(block);
  }
  return sections;
}

/** Agrupa blocos de uma seção em módulos recolhíveis (subheadings). */
function toModules(blocks: Block[]) {
  const intro: string[] = [];
  const modules: Array<{ title: string; topics: string[] }> = [];
  for (const block of blocks) {
    if (block.type === "subheading") {
      modules.push({ title: block.text, topics: [] });
    } else if (block.type === "paragraph" && modules.length > 0) {
      modules[modules.length - 1].topics.push(block.text);
    } else if (block.type === "paragraph") {
      intro.push(block.text);
    }
  }
  return { intro, modules };
}

function SectionBody({ section }: { section: Section }) {
  const hasModules = section.blocks.some((b) => b.type === "subheading");
  if (!hasModules) {
    return (
      <div className="space-y-4">
        {section.blocks
          .filter((b): b is Exclude<Block, { type: "image" }> => b.type === "paragraph")
          .map((p, i) => (
            <p key={i} className="text-[16.5px] leading-relaxed text-ink-800">
              {p.text}
            </p>
          ))}
      </div>
    );
  }

  const { intro, modules } = toModules(section.blocks);
  return (
    <div className="space-y-4">
      {intro.map((text, i) => (
        <p key={i} className="text-[16.5px] leading-relaxed text-ink-800">
          {text}
        </p>
      ))}
      <div className="space-y-3">
        {modules.map((mod) => {
          const bibIndex = mod.topics.findIndex((t) => t.includes("Bibliografia"));
          const topics = bibIndex === -1 ? mod.topics : mod.topics.slice(0, bibIndex);
          const bib = bibIndex === -1 ? [] : mod.topics.slice(bibIndex + 1);
          return (
            <details
              key={mod.title}
              className="group rounded-2xl border border-sand-300 bg-white open:border-coral-500/60"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-display text-lg text-petrol-700 [&::-webkit-details-marker]:hidden">
                {mod.title}
                <span
                  aria-hidden
                  className="text-coral-600 transition-transform group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <div className="border-t border-sand-200 px-5 py-4">
                <ul className="columns-1 gap-8 text-[15px] leading-[1.9] text-ink-600 sm:columns-2">
                  {topics.map((t, i) => (
                    <li key={i} className="break-inside-avoid">
                      {t}
                    </li>
                  ))}
                </ul>
                {bib.length > 0 && (
                  <>
                    <p className="mb-1 mt-4 text-[14px] font-medium tracking-wide text-coral-700 uppercase">
                      Bibliografia
                    </p>
                    <ul className="text-[15px] italic leading-[1.9] text-ink-600">
                      {bib.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

export default async function Page() {
  const page = await getPage("trabalhos-realizados");
  if (!page) notFound();
  const sections = toSections(page.blocks);

  return (
    <PageShell
      title="Trabalhos Realizados"
      intro="As atividades que a casa oferece — conheça cada uma e veja como participar."
      image="/acervo/2017_10_assistencia-social.jpg"
    >
      <nav aria-label="Trabalhos" className="mb-14">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {sections.map((s) => (
            <li key={s.id}>
              <Link
                href={`#${s.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white transition hover:-translate-y-0.5 hover:border-coral-500 hover:shadow-md"
              >
                {s.image ? (
                  <Image
                    src={s.image}
                    alt=""
                    width={300}
                    height={160}
                    className="h-20 w-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-full bg-petrol-100" />
                )}
                <span className="flex flex-1 items-center justify-center px-2 py-2.5 text-center text-[13.5px] font-medium leading-snug text-petrol-700">
                  {s.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-16">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <div
              className={`flex flex-col gap-6 sm:gap-9 ${
                i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
              }`}
            >
              {s.image && (
                <Image
                  src={s.image}
                  alt=""
                  width={520}
                  height={400}
                  className="h-52 w-full shrink-0 rounded-2xl border border-sand-200 object-cover sm:h-auto sm:max-h-72 sm:w-64"
                />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="mb-3 font-display text-2xl text-petrol-700 sm:text-3xl">
                  {s.title}
                </h2>
                <SectionBody section={s} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
