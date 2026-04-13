import Link from "next/link";

function SignInPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col justify-center gap-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-black/40">
          Sign in
        </p>
        <h1 className="text-4xl font-semibold text-black">Dang nhap theo role</h1>
        <p className="text-base text-black/60">
          Sau khi backend dang nhap xong, chi can set cookie <code>ROLE</code>{" "}
          voi gia tri <code>admin</code>, <code>staff</code> hoac{" "}
          <code>user</code>. Trang <code>/</code> va cac layout se tu render
          dung khu vuc tuong ung.
        </p>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <p className="mb-3 text-sm text-black/60">Flow hien tai:</p>
        <ul className="space-y-2 text-sm text-black/80">
          <li>Khong co cookie ROLE: vao giao dien user mac dinh.</li>
          <li>ROLE = user: vao `/trangChu` voi user layout.</li>
          <li>ROLE = admin: vao `/admin/overView` voi admin layout.</li>
          <li>ROLE = staff: vao `/staff/checkVe` voi staff layout.</li>
        </ul>
      </div>

      <Link
        href="/"
        className="w-fit rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-80"
      >
        Ve trang chinh
      </Link>
    </div>
  );
}

export default SignInPage;
