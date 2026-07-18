import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = { title: "Nossa História" };

export default function Page() {
  return <ContentPage slug="nossa-historia" />;
}
