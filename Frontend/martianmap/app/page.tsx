import AppShell from "@/components/AppShell";
import { I18nProvider } from "@/lib/i18n";

export default function Home() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  );
}
