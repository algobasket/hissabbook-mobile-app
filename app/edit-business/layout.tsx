// Server component layout to handle generateStaticParams for static export
export async function generateStaticParams() {
  // Return empty array - routes will be handled via client-side routing
  return [];
}

export default function EditBusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

