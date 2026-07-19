import { requireAdmin } from "@/lib/session";
import { getPeople } from "@/lib/content";
import PeopleEditor from "@/components/admin/PeopleEditor";

export default async function Page() {
  await requireAdmin();
  const people = await getPeople("worker");
  return (
    <PeopleEditor
      kind="worker"
      title="Trabalhadores"
      hint="A homenagem aos voluntários. Os trabalhos escritos no campo abaixo viram filtros na página (ex.: Palestras, Passes) — separe por vírgula."
      roleLabel="Trabalho (ex.: Palestras, Passes)"
      initial={people.map(({ name, role, photo }) => ({ name, role, photo }))}
    />
  );
}
