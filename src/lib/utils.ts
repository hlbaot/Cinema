import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Định dạng tiền cố định locale — tránh lệch hydration giữa Node và trình duyệt. */
export function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ'
}
