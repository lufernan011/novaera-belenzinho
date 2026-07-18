import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = { title: "Trabalhos Realizados" };

export default function Page() {
  return <ContentPage slug="trabalhos-realizados" />;
}
