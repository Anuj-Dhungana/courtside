export default function StaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <article className="prose-invert">{children}</article>
    </div>
  );
}
