import { redirect } from "next/navigation";

export default async function CategoriaPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  redirect(`/catalogo?categoria=${encodeURIComponent(slug)}`);
}
