import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TodayStrip from "@/components/TodayStrip";
import { formatDate, getPosts, getSettings } from "@/lib/content";

const CARDS = [
  {
    href: "/trabalhos-realizados/",
    title: "Trabalhos realizados",
    text: "Assistência social, reuniões mediúnicas, passes, estudos e mais.",
    image: "/acervo/2017_12_fundadoras-assistencia-social.jpg",
  },
  {
    href: "/horarios/",
    title: "Horários",
    text: "Atividades presenciais e online, de segunda a sábado.",
    image: "/images/hero.jpg",
  },
  {
    href: "/nossa-historia/",
    title: "Nossa história",
    text: "De 1947 aos dias de hoje: mais de 75 anos de caminhada.",
    image: "/acervo/2017_10_inauguracao-sede-propria.jpg",
  },
  {
    href: "/ajude-o-nova-era/",
    title: "Doações",
    text: "Alimentos, bazar, contribuições e trabalho voluntário.",
    image: "/images/campo.jpg",
  },
];

export default async function Home() {
  const [settings, posts] = await Promise.all([getSettings(), getPosts()]);
  const latest = posts.slice(0, 3);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${settings.address_street}, ${settings.address_district}`
  )}`;

  return (
    <>
      <div className="relative">
        <Header overlay />
        <section className="relative flex min-h-[540px] items-end justify-center overflow-hidden sm:min-h-[640px]">
          <Image
            src="/images/hero.jpg"
            alt="Pôr do sol tranquilo sobre um lago"
            fill
            priority
            className="object-cover object-[center_35%]"
          />
          {/* scrim: leve no céu (preserva o sol), firme atrás do texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-twilight-900/45 via-twilight-900/10 to-twilight-900/85" />
          <div className="relative z-10 w-full px-5 pb-14 pt-64 text-center sm:pt-80">
            <p className="mb-4 flex items-center justify-center gap-3 text-[13px] tracking-[0.25em] text-white/95 uppercase sm:text-sm">
              <span aria-hidden className="h-px w-8 bg-amber-500/90" />
              Casa de apoio e esclarecimento · Zona Leste, SP
              <span aria-hidden className="h-px w-8 bg-amber-500/90" />
            </p>
            <h1 className="mx-auto max-w-2xl font-display text-4xl leading-tight text-white drop-shadow-[0_2px_16px_rgba(30,39,64,0.55)] sm:text-5xl">
              “{settings.hero_quote}”
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/95 drop-shadow-[0_1px_8px_rgba(30,39,64,0.6)]">
              {settings.site_tagline}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/horarios/"
                className="rounded-full bg-amber-500 px-7 py-3.5 text-lg font-medium text-ink-900 transition hover:bg-amber-300"
              >
                Ver horários
              </Link>
              <a
                href={mapsUrl}
                rel="noopener"
                className="rounded-full border-2 border-white/80 px-7 py-3 text-lg text-white transition hover:bg-white/10"
              >
                Como chegar
              </a>
            </div>
          </div>
        </section>
      </div>

      <TodayStrip />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="mb-6 text-sm font-medium tracking-widest text-ink-500 uppercase">
            Conheça um pouco mais
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group overflow-hidden rounded-2xl border border-sand-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Image
                  src={card.image}
                  alt=""
                  width={480}
                  height={280}
                  className="h-36 w-full object-cover"
                />
                <div className="px-5 py-4">
                  <h3 className="font-display text-xl text-twilight-700 group-hover:text-coral-600">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">
                    {card.text}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-sand-200 bg-sand-100 px-5 py-12 text-center">
          <blockquote className="mx-auto max-w-2xl">
            <p className="font-display text-2xl leading-relaxed text-ink-800 sm:text-[28px]">
              “{settings.featured_quote}”
            </p>
            <cite className="mt-3 block text-[15px] not-italic text-coral-700">
              {settings.featured_quote_author}
            </cite>
          </blockquote>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-sm font-medium tracking-widest text-ink-500 uppercase">
              Últimas publicações
            </h2>
            <Link
              href="/publicacoes/"
              className="text-[15px] text-coral-700 underline-offset-2 hover:underline"
            >
              ver todas →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <Link
                key={post.slug}
                href={`/publicacoes/${post.slug}/`}
                className="group overflow-hidden rounded-2xl border border-sand-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                {post.cover ? (
                  <Image
                    src={post.cover}
                    alt=""
                    width={480}
                    height={280}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-twilight-700" />
                )}
                <div className="px-5 py-4">
                  <p className="text-xs tracking-wider text-coral-700 uppercase">
                    {post.category || "Publicação"} · {formatDate(post.date)}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg leading-snug text-twilight-700 group-hover:text-coral-600">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
