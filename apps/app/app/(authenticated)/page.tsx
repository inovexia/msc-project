import { auth } from "@repo/auth/server";
import AccountantDashboardPage from "./accountants/dashboard/page";

export default async function AuthenticatedPage() {
  const { has } = await auth();

  const isClient = has({ role: "clients" });

  // If user is an accountant, show the accountant dashboard
  if (!isClient) {
    return <AccountantDashboardPage />;
  }

  // Client view - can be enhanced later with client-specific dashboard
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Client Dashboard</h1>
      <div className="mt-4 p-4 text-white rounded">
        You have client access.
      </div>
      <div className="mt-8">
        <p>Welcome to the authenticated area!</p>
      </div>
    </div>
  );
}
