import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col justify-center gap-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-black/40">
          Sign up
        </p>
        <h1 className="text-4xl font-semibold text-black">Dang ky tai khoan</h1>
        <p className="text-base text-black/60">
          Sau khi dang ky va dang nhap thanh cong, backend co the set cookie{" "}
          <code>ROLE</code> de app dieu huong dung layout theo role.
        </p>
      </div>

      <Link
        href="/auth/signin"
        className="w-fit rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-80"
      >
        Den trang dang nhap
      </Link>
    </div>
  );
}
