'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { API_GetProducts, displayCategory, type ProductDto } from '@/src/api/API_Product'
import { appendLocalFoodSale, loadLocalFoodSales, type StaffFoodSaleLocal } from '@/src/lib/staff-sales-storage'
import { formatVnd } from '@/src/lib/utils'

type CartLine = { product: ProductDto; quantity: number }

const card =
  'rounded-[2rem] border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-sm'

export default function StaffCornPage() {
  const [products, setProducts] = useState<ProductDto[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [historyVersion, setHistoryVersion] = useState(0)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const all = await API_GetProducts()
      const active = all.filter(p => p.status === 'ACTIVE' && p.stock > 0)
      setProducts(active)
      if (active.length === 0) setLoadError('Không có sản phẩm ACTIVE hoặc hết kho.')
    } catch {
      setProducts([])
      setLoadError('Không tải được thực đơn (kiểm tra API / quyền).')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const lines: CartLine[] = useMemo(() => {
    return products
      .map(p => ({ product: p, quantity: cart[p.id] || 0 }))
      .filter(l => l.quantity > 0)
  }, [products, cart])

  const total = useMemo(() => lines.reduce((s, l) => s + l.quantity * l.product.price, 0), [lines])

  const setQty = (p: ProductDto, q: number) => {
    const next = Math.min(Math.max(0, q), p.stock)
    setCart(prev => {
      const copy = { ...prev }
      if (next === 0) delete copy[p.id]
      else copy[p.id] = next
      return copy
    })
  }

  function completeSale() {
    if (lines.length === 0) return
    appendLocalFoodSale(
      lines.map(l => ({
        productId: l.product.id,
        name: l.product.name,
        quantity: l.quantity,
        unitPrice: l.product.price,
      })),
      total
    )
    setCart({})
    setHistoryVersion(v => v + 1)
  }

  const history = useMemo(() => loadLocalFoodSales(), [historyVersion])

  return (
    <div className="space-y-8">
      <section className={card}>
        <h1 className="text-3xl font-bold tracking-tight text-white">Quản lý bán nước / bắp</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Chọn món từ API sản phẩm, thanh toán tại quầy. Lịch sử lưu trên trình duyệt (ghi nhận nhanh khi chưa có API bán hàng).
        </p>
        {loadError ? (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/35 px-4 py-3 text-sm text-amber-200/95">{loadError}</p>
        ) : null}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className={card}>
          <h2 className="text-lg font-bold text-white">Thực đơn</h2>
          {loading ? (
            <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {products.map(p => {
                const q = cart[p.id] || 0
                return (
                  <article key={p.id} className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500/90">{displayCategory(p.category)}</span>
                      <span className="text-sm font-bold text-emerald-400">{formatVnd(p.price)}</span>
                    </div>
                    <h3 className="mt-1 font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-zinc-500">Kho: {p.stock}</p>
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-1.5">
                      <button
                        type="button"
                        aria-label="Giảm"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-25"
                        disabled={q === 0}
                        onClick={() => setQty(p, q - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center font-bold text-white">{q}</span>
                      <button
                        type="button"
                        aria-label="Tăng"
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:opacity-25"
                        disabled={q >= p.stock}
                        onClick={() => setQty(p, q + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className={card}>
            <h2 className="text-lg font-bold text-white">Giỏ quầy</h2>
            {lines.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Chưa chọn món.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {lines.map(l => (
                  <li key={l.product.id} className="flex justify-between gap-2 border-b border-zinc-800 pb-2">
                    <span className="text-zinc-300">
                      {l.product.name} ×{l.quantity}
                    </span>
                    <span className="shrink-0 font-semibold text-white">{formatVnd(l.quantity * l.product.price)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex items-end justify-between border-t border-zinc-800 pt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tổng</span>
              <span className="text-xl font-bold text-emerald-400">{formatVnd(total)}</span>
            </div>
            <button
              type="button"
              disabled={lines.length === 0}
              onClick={completeSale}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:opacity-35"
            >
              Hoàn tất đơn
            </button>
          </div>

          <div className={card}>
            <h2 className="text-lg font-bold text-white">Đơn gần đây</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">Chưa có đơn.</p>
            ) : (
              <ul className="mt-4 max-h-72 space-y-4 overflow-y-auto text-sm">
                {history.slice(0, 20).map((h: StaffFoodSaleLocal) => (
                  <li key={h.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
                    <p className="text-xs text-zinc-500">{new Date(h.createdAt).toLocaleString('vi-VN')}</p>
                    <p className="mt-1 font-bold text-emerald-400">{formatVnd(h.totalVnd)}</p>
                    <p className="mt-1 text-xs text-zinc-400">{h.lines.map(l => `${l.name}×${l.quantity}`).join(', ')}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
