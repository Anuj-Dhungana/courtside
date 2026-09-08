import { redirect } from "next/navigation";

export default async function WatchByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/watch?eventId=${encodeURIComponent(id)}`);
}
