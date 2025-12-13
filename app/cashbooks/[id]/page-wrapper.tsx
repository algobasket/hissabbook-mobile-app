import BookDetailPageClient from "./page";

export async function generateStaticParams() {
  return [];
}

export default function BookDetailPageWrapper() {
  return <BookDetailPageClient />;
}


