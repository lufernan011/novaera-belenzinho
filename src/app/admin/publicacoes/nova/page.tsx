import { requireAdmin } from "@/lib/session";
import PostEditor from "@/components/admin/PostEditor";

export default async function Page() {
  await requireAdmin();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return (
    <PostEditor
      initial={{
        title: "",
        date: today,
        category: "",
        cover: "",
        blocks: [{ type: "paragraph", text: "" }],
        published: true,
      }}
    />
  );
}
