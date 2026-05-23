import { RepositoriesPageClient } from "@/features/sources/connectors/repositories";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function RepositoriesPage() {
  return (
    <AuthGuard>
      <RepositoriesPageClient />
    </AuthGuard>
  );
}