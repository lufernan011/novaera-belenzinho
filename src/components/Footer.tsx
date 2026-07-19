import Link from "next/link";
import { getSettings } from "@/lib/content";

export default async function Footer() {
  const s = await getSettings();

  return (
    <footer className="mt-auto bg-twilight-800 text-twilight-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="mb-2 font-display text-lg text-amber-500">Endereço</h2>
          <p className="text-[15px] leading-relaxed">
            {s.address_street}
            <br />
            {s.address_district}
            <br />
            CEP {s.address_zip}
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-display text-lg text-amber-500">Contato</h2>
          <p className="text-[15px] leading-relaxed">
            <a href={`tel:+55${s.phone.replace(/\D/g, "")}`} className="hover:text-white">
              {s.phone}
            </a>
            <br />
            <a href={`mailto:${s.email}`} className="hover:text-white">
              {s.email.split("@")[0]}@<wbr />
              {s.email.split("@")[1]}
            </a>
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-display text-lg text-amber-500">Secretaria</h2>
          <p className="text-[15px] leading-relaxed">{s.secretary_hours}</p>
        </div>
        <div>
          <h2 className="mb-2 font-display text-lg text-amber-500">Acompanhe</h2>
          <p className="text-[15px] leading-relaxed">
            <a href={s.facebook_url} className="hover:text-white" rel="noopener">
              Facebook
            </a>
            <br />
            <Link href="/publicacoes/" className="hover:text-white">
              Publicações
            </Link>
            <br />
            <Link href="/ajude-o-nova-era/" className="hover:text-white">
              Ajude o Nova Era
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-twilight-100/70">
        Centro Espírita Nova Era · Belenzinho, São Paulo · desde 1947
      </div>
    </footer>
  );
}
