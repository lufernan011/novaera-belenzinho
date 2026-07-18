import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TodayStrip from "@/components/TodayStrip";

/**
 * Casca das páginas internas: header sólido, faixa de título em
 * crepúsculo, conteúdo e footer.
 */
export default function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="bg-twilight-700 pb-10 pt-8 text-center">
        <h1 className="font-display text-3xl text-white sm:text-4xl">{title}</h1>
        {intro && (
          <p className="mx-auto mt-3 max-w-2xl px-5 text-[17px] text-twilight-100">
            {intro}
          </p>
        )}
      </div>
      <TodayStrip />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">{children}</main>
      <Footer />
    </>
  );
}
