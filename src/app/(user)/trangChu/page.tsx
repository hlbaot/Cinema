export default function UserHomePage() {
  return (
    <section className="w-full rounded-[2rem] bg-white p-10 shadow-sm ring-1 ring-black/5">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-black/40">
        User Home
      </p>
      <h1 className="text-4xl font-semibold text-black">Trang chu nguoi dung</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-black/65">
        Day la giao dien mac dinh khi vua vao web. Neu chua dang nhap hoac cookie
        ROLE la <code>user</code>, app se giu nguoi dung trong layout nay.
      </p>
    </section>
  );
}
