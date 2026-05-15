export enum PaymentProvider {
  CASH = 'cash',
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  STRIPE = 'stripe',
  MANUAL = 'manual',
  PAYOS = 'payos',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}
