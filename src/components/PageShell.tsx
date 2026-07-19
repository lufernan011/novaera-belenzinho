import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TodayStrip from "@/components/TodayStrip";

/**
 * Casca das páginas internas: header sólido, faixa de título (com foto
 * de fundo opcional, escurecida em verde-petróleo), conteúdo e footer.
 */
export default function PageShell({
  title,
  intro,
  image,
  imageAlt = "",
  children,
}: {
  title: string;
  intro?: string;
  image?: string;
  imageAlt?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="relative overflow-hidden bg-petrol-700 pb-12 pt-10 text-center">
        {image && (
          <>
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-petrol-800/70" />
          </>
        )}
        <div className="relative z-10">
          <h1 className="font-display text-3xl text-white drop-shadow-[0_1px_10px_rgba(20,37,42,0.6)] sm:text-4xl">
            {title}
          </h1>
          {intro && (
            <p className="mx-auto mt-3 max-w-2xl px-5 text-[17px] text-petrol-100 drop-shadow-[0_1px_8px_rgba(20,37,42,0.7)]">
              {intro}
            </p>
          )}
        </div>
      </div>
      <TodayStrip />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">{children}</main>
      <Footer />
    </>
  );
}
