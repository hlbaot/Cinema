const KEY_TICKETS = 'cinema_staff_ticket_sales_v1'
const KEY_FOOD = 'cinema_staff_food_sales_v1'

export interface StaffTicketSaleLocal {
  id: string
  code: string
  movieInfo: string
  seats: string
  amountVnd: number
  createdAt: string
}

export interface StaffFoodSaleLine {
  productId: string
  name: string
  quantity: number
  unitPrice: number
}

export interface StaffFoodSaleLocal {
  id: string
  lines: StaffFoodSaleLine[]
  totalVnd: number
  createdAt: string
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const v = JSON.parse(raw) as T
    return v ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function loadLocalTicketSales(): StaffTicketSaleLocal[] {
  return readJson<StaffTicketSaleLocal[]>(KEY_TICKETS, [])
}

export function appendLocalTicketSale(row: Omit<StaffTicketSaleLocal, 'id' | 'createdAt'>) {
  const list = loadLocalTicketSales()
  const next: StaffTicketSaleLocal = {
    ...row,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  writeJson(KEY_TICKETS, [next, ...list])
  return next
}

export function loadLocalFoodSales(): StaffFoodSaleLocal[] {
  return readJson<StaffFoodSaleLocal[]>(KEY_FOOD, [])
}

export function appendLocalFoodSale(lines: StaffFoodSaleLine[], totalVnd: number) {
  const list = loadLocalFoodSales()
  const next: StaffFoodSaleLocal = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `f-${Date.now()}`,
    lines,
    totalVnd,
    createdAt: new Date().toISOString(),
  }
  writeJson(KEY_FOOD, [next, ...list])
  return next
}
