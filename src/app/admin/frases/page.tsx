import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/content";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function Page() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <SettingsForm
      title="Frases da página inicial"
      hint="A frase grande sobre a foto do pôr do sol e a mensagem em destaque no meio da página."
      label="Frases"
      initial={settings}
      fields={[
        { key: "hero_quote", label: "Frase principal (sobre a foto)", multiline: true },
        { key: "site_tagline", label: "Texto de boas-vindas (abaixo da frase)", multiline: true },
        { key: "featured_quote", label: "Mensagem em destaque (meio da página)", multiline: true },
        { key: "featured_quote_author", label: "Autor da mensagem" },
      ]}
    />
  );
}
