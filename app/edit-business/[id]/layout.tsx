// Server component layout to handle generateStaticParams for static export
export async function generateStaticParams() {
  // Return empty array - dynamic routes will be handled client-side
  return [];
}

export default function EditBusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}





