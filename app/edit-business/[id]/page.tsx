import EditBusinessPageClient from "./page-client";

export async function generateStaticParams() {
  // Return placeholder for static export validation
  // Actual routes will be handled via client-side routing
  return [{ id: '__placeholder__' }];
}

export default function EditBusinessPageWrapper() {
  return <EditBusinessPageClient />;
}
