function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
}

export function ticketEmailTemplate(data: {
  ticketCode: string;
  bookingCode: string;
  movieTitle: string;
  movieDurationMinutes: number | null;
  movieAgeRating: string | null;
  moviePosterUrl: string | null;
  cinemaName: string;
  showDate: string;
  startTime: string;
  roomName: string;
  seats: string;
  totalPrice: number;
  qrCodeUrl: string;
}) {
  const ageRating = data.movieAgeRating ?? 'P';
  const posterBlock = data.moviePosterUrl
    ? `<img src="${escapeHtml(data.moviePosterUrl)}" alt="${escapeHtml(data.movieTitle)}" width="220" height="245" style="display:block; width:220px; height:245px; object-fit:cover; border:0;" />`
    : `<div style="width:220px; height:245px; background:#090d16; background-image:linear-gradient(145deg,#090d16,#111827);"></div>`;

  return `
  <div style="margin:0; padding:28px 0; background:#070707; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="520" style="width:520px; max-width:100%; border-collapse:separate; border-spacing:0; background:#171918; border:1px solid #2b2f2d; border-radius:26px; overflow:hidden; color:#f8fafc;">
            <tr>
              <td style="padding:0;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td width="220" valign="top" style="width:220px; background:#0b0e14; position:relative;">
                      ${posterBlock}
                      <div style="margin-top:-52px; padding:0 0 22px 20px;">
                        <span style="display:inline-block; background:#ed101c; color:#ffffff; font-weight:800; font-size:14px; line-height:1; padding:9px 11px; border-radius:5px;">${escapeHtml(ageRating)}</span>
                      </div>
                    </td>
                    <td valign="top" style="padding:30px 28px 24px; background:#171918;">
                      <div style="font-size:30px; line-height:1.12; font-weight:900; letter-spacing:.3px; color:#ffffff; text-transform:uppercase;">${escapeHtml(data.movieTitle)}</div>
                      <div style="margin-top:14px; color:#d6b5ad; font-size:14px; font-weight:700;">&#9716; ${escapeHtml(data.movieDurationMinutes ?? '')} min</div>

                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:32px; border-collapse:collapse;">
                        <tr>
                          <td width="52%" style="padding:0 12px 18px 0;">
                            <div style="font-size:13px; color:#aaa4a4; font-weight:900; letter-spacing:1.7px; text-transform:uppercase;">Theater</div>
                            <div style="margin-top:7px; color:#ffffff; font-size:21px; font-weight:700;">${escapeHtml(data.cinemaName || data.roomName)}</div>
                          </td>
                          <td style="padding:0 0 18px 12px;">
                            <div style="font-size:13px; color:#aaa4a4; font-weight:900; letter-spacing:1.7px; text-transform:uppercase;">Date</div>
                            <div style="margin-top:7px; color:#ffffff; font-size:21px; font-weight:700;">${escapeHtml(formatDate(data.showDate))}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 12px 0 0;">
                            <div style="font-size:13px; color:#aaa4a4; font-weight:900; letter-spacing:1.7px; text-transform:uppercase;">Time</div>
                            <div style="margin-top:7px; color:#ffffff; font-size:21px; font-weight:700;">${escapeHtml(data.startTime)}</div>
                          </td>
                          <td style="padding:0 0 0 12px;">
                            <div style="font-size:13px; color:#aaa4a4; font-weight:900; letter-spacing:1.7px; text-transform:uppercase;">Row/Seat</div>
                            <div style="margin-top:7px; color:#ffffff; font-size:21px; font-weight:700;">${escapeHtml(data.seats)}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="height:28px; border-top:1px solid #313532; border-bottom:1px solid #313532; background:#1d201e;">
                <div style="height:1px; border-top:1px dashed #343a36; margin:13px 0;"></div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:38px 30px 34px; background:#171918;">
                <div style="background:#fff7f7; border-radius:14px; padding:14px; display:inline-block; box-shadow:0 0 0 1px rgba(255,255,255,.12);">
                  <img src="${escapeHtml(data.qrCodeUrl)}" alt="Ticket QR" width="220" height="220" style="display:block; width:220px; height:220px; border:0;" />
                </div>
                <div style="margin-top:24px; color:#d8b8b2; font-size:14px; font-weight:900; letter-spacing:4px; text-transform:uppercase;">Scan at the entrance</div>

                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:26px; border-collapse:collapse;">
                  <tr>
                    <td align="left" style="color:#8f9494; font-size:13px; line-height:1.7;">
                      <div><strong style="color:#ffffff;">Mã vé:</strong> ${escapeHtml(data.ticketCode)}</div>
                      <div><strong style="color:#ffffff;">Mã đặt vé:</strong> ${escapeHtml(data.bookingCode)}</div>
                      <div><strong style="color:#ffffff;">Phòng:</strong> ${escapeHtml(data.roomName)}</div>
                    </td>
                    <td align="right" style="color:#ffffff; font-size:20px; font-weight:900; white-space:nowrap;">
                      ${escapeHtml(data.totalPrice.toLocaleString('vi-VN'))}đ
                    </td>
                  </tr>
                </table>

                <div style="margin-top:24px; padding-top:18px; border-top:1px solid #2e3330; color:#8f9494; font-size:12px; line-height:1.6;">
                  Vé chỉ có hiệu lực cho đúng suất chiếu đã đặt. Vui lòng đến rạp trước giờ chiếu 15 phút.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}
