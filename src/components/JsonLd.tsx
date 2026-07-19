import { DAY_NAMES, getSchedule, getSettings } from "@/lib/content";

const SCHEMA_DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/**
 * Dados estruturados (schema.org) da casa: essenciais para SEO local,
 * rich results e respostas de assistentes de IA.
 */
export default async function JsonLd() {
  const [s, schedule] = await Promise.all([getSettings(), getSchedule()]);

  const byDay = new Map<number, { min: string; max: string }>();
  for (const item of schedule) {
    const cur = byDay.get(item.day);
    byDay.set(item.day, {
      min: cur && cur.min < item.time ? cur.min : item.time,
      max: cur && cur.max > item.time ? cur.max : item.time,
    });
  }

  const data = {
    "@context": "https://schema.org",
    "@type": "PlaceOfWorship",
    name: s.site_name || "Centro Espírita Nova Era",
    alternateName: "Nova Era Belenzinho",
    description:
      "Casa espírita de apoio e esclarecimento físico e espiritual, sem fins lucrativos, fundada em 1947 no Belenzinho, Zona Leste de São Paulo. Palestras, passes, reuniões mediúnicas, estudos da doutrina espírita e assistência social.",
    url: "https://www.novaerabelenzinho.org.br/",
    telephone: `+55 ${s.phone}`,
    email: s.email,
    foundingDate: "1947-09-23",
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address_street,
      addressLocality: "São Paulo",
      addressRegion: "SP",
      postalCode: s.address_zip,
      addressCountry: "BR",
    },
    image: "https://www.novaerabelenzinho.org.br/opengraph-image.jpg",
    sameAs: [s.facebook_url].filter(Boolean),
    openingHoursSpecification: [...byDay.entries()].map(([day, range]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${SCHEMA_DAYS[day]}`,
      opens: range.min,
      closes: range.max,
      description: `Atividades de ${DAY_NAMES[day].toLowerCase()}`,
    })),
    isAccessibleForFree: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
