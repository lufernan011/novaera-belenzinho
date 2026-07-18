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
      hint="As gestões da casa, da mais recente para a mais antiga. Você pode incluir o período no cargo (ex.: Presidente 2010–2014)."
      roleLabel="Cargo e período (ex.: Presidente / Vice · 2010–2014)"
      initial={people.map(({ name, role, photo }) => ({ name, role, photo }))}
    />
  );
}
