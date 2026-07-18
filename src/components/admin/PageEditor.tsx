"use client";

import { useState } from "react";
import type { Block } from "@/db/schema";
import { savePageBlocks } from "@/app/admin/actions";
import BlocksEditor from "./BlocksEditor";
import { EditorHeader, SaveBar } from "./ui";

export default function PageEditor({
  slug,
  title,
  initial,
}: {
  slug: string;
  title: string;
  initial: Block[];
}) {
  const [blocks, setBlocks] = useState<Block[]>(initial);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <EditorHeader
        title={`Página: ${title}`}
        hint="Cada cartão é um pedaço da página, na mesma ordem em que aparece no site."
      />
      <BlocksEditor blocks={blocks} onChange={setBlocks} />
      <SaveBar
        entity={`page:${slug}`}
        onSave={() => savePageBlocks(slug, blocks)}
        onUndone={() => window.location.reload()}
      />
    </main>
  );
}
