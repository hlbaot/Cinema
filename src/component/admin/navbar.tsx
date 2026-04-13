import Link from "next/link";

const adminLinks = [
  { href: "/admin/overView", label: "Tong quan" },
  { href: "/admin/qlyUser", label: "Quan ly user" },
  { href: "/admin/qlyPhim", label: "Quan ly phim" },
  { href: "/admin/qlyPhong", label: "Quan ly phong" },
  { href: "/admin/qlyCorn", label: "Quan ly bap nuoc" },
  { href: "/admin/qlySchedule", label: "Quan ly lich" },
];

export default function AdminNavbar() {
  return (
    <aside className="min-h-screen w-72 border-r border-white/10 bg-slate-950 px-5 py-6 text-white">
      <div className="mb-6 text-xl font-semibold">Admin Panel</div>
      <nav className="flex flex-col gap-2">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
