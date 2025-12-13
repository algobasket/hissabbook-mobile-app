// Server component wrapper for static export
import MembersPageClient from "./page-client";

export async function generateStaticParams() {
  // Return empty array - routes will be handled via client-side routing
  return [];
}

export default function MembersPageWrapper() {
  return <MembersPageClient />;
}
