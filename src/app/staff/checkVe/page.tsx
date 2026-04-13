export default function StaffCheckTicketPage() {
  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">
        Staff
      </p>
      <h1 className="text-3xl font-semibold text-emerald-950">Check ve</h1>
      <p className="mt-4 text-emerald-900/70">
        Khi cookie <code>ROLE=staff</code>, app se vao layout staff va route nay.
      </p>
    </section>
  );
}
