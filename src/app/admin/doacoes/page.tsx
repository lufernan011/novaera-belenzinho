import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/content";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function Page() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <SettingsForm
      title="Doações e PIX"
      hint="Estes dados aparecem na página Ajude o Nova Era."
      label="Doações"
      initial={settings}
      fields={[
        { key: "donation_pix", label: "Chave PIX", help: "Pode ser o CNPJ, e-mail ou telefone. Se preencher, ganha destaque na página." },
        { key: "donation_bank", label: "Banco" },
        { key: "donation_agency", label: "Agência" },
        { key: "donation_account", label: "Conta corrente" },
        { key: "donation_holder", label: "Nome do titular" },
        { key: "donation_cnpj", label: "CNPJ" },
      ]}
    />
  );
}
