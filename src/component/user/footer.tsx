const aboutLinks = ["Gioi thieu", "He thong rap", "Tuyen dung", "Lien he quang cao"];
const serviceLinks = ["IMAX", "Gold Class", "Dolby Atmos", "4DX", "Thue rap"];

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 7.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 7.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 16.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 16.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.34 2.28a2 2 0 0 1-.57 1.73l-1.3 1.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.73-.57l2.28.34A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="m22 7-10 7L2 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s-6-5.33-6-11a6 6 0 1 1 12 0c0 5.67-6 11-6 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function UserFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-red-600 to-red-700">
                <FilmIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-red-500">CINE</span>
                <span className="text-white">PRO</span>
              </span>
            </div>

            <p className="mb-4 text-sm text-gray-400">
              He thong rap chieu phim cao cap hang dau Viet Nam voi cong nghe IMAX,
              Dolby Atmos va dich vu Gold Class dang cap.
            </p>

            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-blue-600"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
                </svg>
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-pink-600"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98C0 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838A6.162 6.162 0 1 0 12 18a6.162 6.162 0 0 0 0-12.162Zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
                </svg>
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-red-600"
                aria-label="YouTube"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">Ve CINEPRO</h4>
            <ul className="space-y-2">
              {aboutLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 transition-colors hover:text-yellow-400">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">Dich vu</h4>
            <ul className="space-y-2">
              {serviceLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 transition-colors hover:text-yellow-400">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">Lien he</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Hotline: 1900 6969</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>support@cinepro.vn</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Landmark 81, Q. Binh Thanh, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">© 2024 CINEPRO. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
              Dieu khoan su dung
            </a>
            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
              Chinh sach bao mat
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
