// Server component layout to handle generateStaticParams for static export
export async function generateStaticParams() {
  // Return empty array - routes will be handled via client-side routing
  // For static export, we can't pre-generate all dynamic routes
  return [];
}

export default function CashbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

