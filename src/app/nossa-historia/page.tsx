import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Nossa História",
  description:
    "A história do Centro Espírita Nova Era desde 1947: os fundadores, a sede própria no Belenzinho, as reformas e mais de 75 anos de trabalho espírita em São Paulo.",
};

export default function Page() {
  return <ContentPage slug="nossa-historia" image="/acervo/2017_10_salao-rua-belem.jpg" />;
}
