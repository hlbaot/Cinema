import Link from "next/link";

const staffLinks = [
  { href: "/staff/checkVe", label: "Check ve" },
  { href: "/staff/qlyVe", label: "Quan ly ve" },
  { href: "/staff/qlyBapNuoc", label: "Quan ly bap nuoc" },
];

export default function StaffNavbar() {
  return (
    <aside className="min-h-screen w-72 border-r border-emerald-200 bg-emerald-50 px-5 py-6">
      <div className="mb-6 text-xl font-semibold text-emerald-950">Staff Panel</div>
      <nav className="flex flex-col gap-2">
        {staffLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl px-4 py-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-600 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
