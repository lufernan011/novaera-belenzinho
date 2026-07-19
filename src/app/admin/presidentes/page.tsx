import { requireAdmin } from "@/lib/session";
import { getPeople } from "@/lib/content";
import PeopleEditor from "@/components/admin/PeopleEditor";

export default async function Page() {
  await requireAdmin();
  const people = await getPeople("president");
  return (
    <PeopleEditor
      kind="president"
      title="Presidentes"
      hint="O site mostra as gestões numa linha do tempo, na ordem desta lista (a primeira aparece no topo). Inclua o período no cargo, ex.: Presidente / Vice · 2010–2014."
      roleLabel="Cargo e período (ex.: Presidente / Vice · 2010–2014)"
      initial={people.map(({ name, role, photo }) => ({ name, role, photo }))}
    />
  );
}
