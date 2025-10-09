import { useUser } from "@repo/auth/client";
import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
export default async function AuthenticatedPage() {
  const { has } = await auth();
  // const { user } = useUser();
  // const isClient = user?.organizationMemberships?.some(
  //   (membership) => membership.role === "clients"
  // );

  const isClient = has({ role: "clients" });
  // const router = useRouter();
  // const handleClick = () => {
  //   router.push("/upload");
  // };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {isClient && (
        <>
          <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded">
            You have client access.
          </div>

          <Link href="/upload">
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              Upload Documents
            </button>
          </Link>
        </>
      )}

      <div className="mt-8">
        <p>Welcome to the authenticated area!</p>
      </div>
    </div>
  );
}
