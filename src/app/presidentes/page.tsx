import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PeopleGrid from "@/components/PeopleGrid";
import { getPeople } from "@/lib/content";

export const metadata: Metadata = { title: "Presidentes" };

export default async function Page() {
  const presidents = await getPeople("president");
  return (
    <PageShell
      title="Presidentes"
      intro="Homenagem às gestões que conduziram o Nova Era ao longo das décadas. Pedimos desculpas antecipadas por eventuais omissões."
    >
      <PeopleGrid people={presidents} columns={3} />
    </PageShell>
  );
}
