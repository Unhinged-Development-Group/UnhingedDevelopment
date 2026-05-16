import { redirect } from "next/navigation";

export default async function CompanyRoot({ params }: { params: Promise<{ company: string }> }) {
  const { company } = await params;
  redirect(`/portal/${company}/documents`);
}
