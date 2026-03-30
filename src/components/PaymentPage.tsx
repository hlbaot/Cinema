import { useState } from 'react';
import { ChevronRight, CreditCard, Wallet, Gift, Shield, Check, ChevronDown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Movie, Showtime, Cinema, Seat } from '../types';

interface PaymentPageProps {
  movie: Movie;
  showtime: Showtime;
  cinema: Cinema;
  selectedSeats: Seat[];
  onConfirm: (paymentMethod: string) => void;
  onBack: () => void;
}

export default function PaymentPage({
  movie,
  showtime,
  cinema,
  selectedSeats,
  onConfirm,
  onBack
}: PaymentPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [showEwallets, setShowEwallets] = useState(false);

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = 10000;
  const discount = promoApplied ? Math.floor(subtotal * 0.1) : 0;
  const total = subtotal + serviceFee - discount;

  const ewallets = [
    { id: 'momo', name: 'MoMo', color: 'from-pink-600 to-pink-700', icon: '💳' },
    { id: 'zalopay', name: 'ZaloPay', color: 'from-blue-600 to-blue-700', icon: '💰' },
    { id: 'shopeepay', name: 'ShopeePay', color: 'from-orange-600 to-orange-700', icon: '🛒' },
    { id: 'vnpay', name: 'VNPay', color: 'from-red-600 to-red-700', icon: '🏦' },
  ];

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'cinepro10') {
      setPromoApplied(true);
    }
  };

  const isCardValid = paymentMethod === 'card' && cardNumber.length >= 16 && cardName && cardExpiry && cardCvv.length >= 3;
  const isEwalletSelected = ewallets.some(w => w.id === paymentMethod);
  const canProceed = isCardValid || isEwalletSelected;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black pt-16 lg:pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Chọn ghế', 'Thanh toán', 'Hoàn tất'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i <= 1 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'
              }`}>
                {i < 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`hidden sm:inline text-sm ${
                i <= 1 ? 'text-white font-medium' : 'text-gray-400'
              }`}>
                {step}
              </span>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-600" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-2xl font-bold text-white">Phương thức thanh toán</h2>

            {/* Credit Card */}
            <div 
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                paymentMethod === 'card' 
                  ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'card' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">Thẻ tín dụng / Ghi nợ</h3>
                  <p className="text-gray-400 text-sm">Visa, Mastercard, JCB</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'card' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-600'
                }`}>
                  {paymentMethod === 'card' && <Check className="w-3 h-3 text-black" />}
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Số thẻ</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Tên trên thẻ</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A"
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Ngày hết hạn</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="***"
                        className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* E-Wallets */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <button
                onClick={() => setShowEwallets(!showEwallets)}
                className="w-full flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-white">Ví điện tử</h3>
                  <p className="text-gray-400 text-sm">MoMo, ZaloPay, ShopeePay, VNPay</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showEwallets ? 'rotate-180' : ''}`} />
              </button>

              {showEwallets && (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
                  {ewallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => setPaymentMethod(wallet.id)}
                      className={`p-4 rounded-xl border transition-all ${
                        paymentMethod === wallet.id
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-2xl`}>
                        {wallet.icon}
                      </div>
                      <p className="text-white font-medium text-center">{wallet.name}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* QR Code for selected e-wallet */}
              {isEwalletSelected && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">Quét mã QR để thanh toán</p>
                    <div className="inline-block p-4 bg-white rounded-xl">
                      <QRCodeSVG 
                        value={`cinepro://pay/${paymentMethod}/${total}`}
                        size={180}
                        level="H"
                      />
                    </div>
                    <p className="text-yellow-400 font-bold text-xl mt-4">
                      {total.toLocaleString()}đ
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Mã thanh toán hết hạn sau 15:00
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Mã khuyến mãi</h3>
                  <p className="text-gray-400 text-sm">Nhập mã CINEPRO10 để giảm 10%</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Nhập mã khuyến mãi"
                  disabled={promoApplied}
                  className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={promoApplied || !promoCode}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    promoApplied 
                      ? 'bg-green-500 text-black' 
                      : 'bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {promoApplied ? <Check className="w-5 h-5" /> : 'Áp dụng'}
                </button>
              </div>
              {promoApplied && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Đã áp dụng mã giảm 10%
                </p>
              )}
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium">Thanh toán an toàn</p>
                <p className="text-gray-400">Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối.</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-white text-lg">Chi tiết đơn hàng</h3>
              </div>

              {/* Movie Info */}
              <div className="p-4 border-b border-white/10">
                <div className="flex gap-4">
                  <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{movie.title}</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-400">
                      <p>{showtime.format} • {movie.rating}</p>
                      <p>{cinema.name}</p>
                      <p>{showtime.date} • {showtime.time}</p>
                      <p className="text-yellow-400 font-medium">
                        Ghế: {selectedSeats.map(s => s.id).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 border-b border-white/10 space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Vé ({selectedSeats.length}x)</span>
                  <span>{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Phí dịch vụ</span>
                  <span>{serviceFee.toLocaleString()}đ</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-400">
                    <span>Giảm giá (10%)</span>
                    <span>-{discount.toLocaleString()}đ</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="p-4 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Tổng cộng</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {total.toLocaleString()}đ
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-3">
                <button
                  onClick={() => canProceed && onConfirm(paymentMethod)}
                  disabled={!canProceed}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    canProceed
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-400 hover:to-amber-500 hover:scale-[1.02]'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  XÁC NHẬN THANH TOÁN
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
