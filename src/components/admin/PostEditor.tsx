"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Block } from "@/db/schema";
import {
  createPost,
  deletePost,
  savePost,
  type PostInput,
  type SaveResult,
} from "@/app/admin/actions";
import BlocksEditor from "./BlocksEditor";
import { EditorHeader, PhotoInput, SaveBar, inputCls } from "./ui";

const CATEGORIES = ["Palestra", "Seminário", "Matéria", "Assistência Social", "Aviso", "Evento"];

export default function PostEditor({
  id,
  initial,
}: {
  id?: number;
  initial: PostInput;
}) {
  const router = useRouter();
  const [post, setPost] = useState<PostInput>(initial);
  const [pending, startTransition] = useTransition();

  function set(patch: Partial<PostInput>) {
    setPost((p) => ({ ...p, ...patch }));
  }

  async function save(): Promise<SaveResult> {
    if (id) return savePost(id, post);
    const r = await createPost(post);
    if (r.ok && r.id) router.replace(`/admin/publicacoes/${r.id}/`);
    return r;
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <EditorHeader
        title={id ? "Editar publicação" : "Nova publicação"}
        hint="Escreva como numa carta: título, textos e fotos. Ao salvar, aparece na página de Publicações."
      />

      <div className="space-y-5 rounded-2xl border border-sand-300 bg-white p-5">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-[16px] font-medium text-petrol-700">
            Título
          </label>
          <input
            id="title"
            type="text"
            value={post.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Ex.: Palestra — O poder da oração"
            className={`${inputCls} font-display text-xl`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="mb-1.5 block text-[16px] font-medium text-petrol-700">
              Data
            </label>
            <input
              id="date"
              type="date"
              value={post.date}
              onChange={(e) => set({ date: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-[16px] font-medium text-petrol-700">
              Tipo
            </label>
            <select
              id="category"
              value={post.category}
              onChange={(e) => set({ category: e.target.value })}
              className={inputCls}
            >
              <option value="">— escolha —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-[16px] font-medium text-petrol-700">
            Foto de capa
          </span>
          <PhotoInput value={post.cover} onChange={(url) => set({ cover: url })} label="Capa" />
        </div>
      </div>

      <h2 className="mb-3 mt-8 font-display text-2xl text-petrol-700">Conteúdo</h2>
      <BlocksEditor blocks={post.blocks} onChange={(blocks) => set({ blocks })} />

      {id && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-white p-4">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("Tem certeza que quer tirar esta publicação do site?")) {
                startTransition(async () => {
                  const r = await deletePost(id);
                  if (r.ok) router.replace("/admin/publicacoes/");
                });
              }
            }}
            className="text-[15px] text-red-700 underline-offset-2 hover:underline"
          >
            Tirar esta publicação do site
          </button>
          <p className="mt-1 text-[14px] text-ink-500">
            Ela sai do site, mas fica guardada e dá para trazer de volta com o Desfazer.
          </p>
        </div>
      )}

      <SaveBar
        entity={id ? `post:${id}` : "post:nova"}
        onSave={save}
        onUndone={() => window.location.reload()}
      />
    </main>
  );
}
