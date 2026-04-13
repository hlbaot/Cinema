export default function AdminOverviewPage() {
  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
        Admin
      </p>
      <h1 className="text-3xl font-semibold text-slate-950">Tong quan he thong</h1>
      <p className="mt-4 text-slate-600">
        Khi cookie <code>ROLE=admin</code>, nguoi dung se duoc dua vao khu vuc nay.
      </p>
    </section>
  );
}
