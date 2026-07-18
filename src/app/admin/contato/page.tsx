import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/content";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function Page() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <SettingsForm
      title="Telefone e endereço"
      hint="Estas informações aparecem no rodapé de todas as páginas e na página Fale Conosco."
      label="Contato"
      initial={settings}
      fields={[
        { key: "phone", label: "Telefone", help: "Ex.: (11) 2618-4177" },
        { key: "whatsapp", label: "WhatsApp (só números, com DDD)", help: "Se preencher, aparece um botão de WhatsApp no Fale Conosco. Ex.: 11987654321" },
        { key: "email", label: "E-mail" },
        { key: "address_street", label: "Endereço (rua e número)" },
        { key: "address_district", label: "Bairro e cidade" },
        { key: "address_zip", label: "CEP" },
        { key: "secretary_hours", label: "Horário da secretaria", multiline: true },
        { key: "facebook_url", label: "Página do Facebook (endereço completo)" },
      ]}
    />
  );
}
