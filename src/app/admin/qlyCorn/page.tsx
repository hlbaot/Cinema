'use client'

import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  API_CreateProduct,
  API_DeleteProduct,
  API_GetProducts,
  API_UpdateProduct,
  PRODUCT_CATEGORY_LABELS,
  displayCategory,
  toApiCategory,
  type ProductCategoryLabel,
  type ProductDto,
} from '@/src/api/API_Product'

type CornCategory = ProductCategoryLabel

type ProductFormValues = {
  active: boolean
  category: CornCategory
  image_url: string
  name: string
  price: number
  stock: number
}

const EMPTY_FORM: ProductFormValues = {
  active: true,
  category: 'Bắp',
  image_url: '',
  name: '',
  price: 0,
  stock: 0,
}

const CATEGORY_STYLES: Record<CornCategory, string> = {
  Bắp: 'border-amber-500/25 bg-amber-500/15 text-amber-300',
  'Đồ uống': 'border-sky-500/25 bg-sky-500/15 text-sky-300',
  Combo: 'border-pink-500/25 bg-pink-500/15 text-pink-300',
  Khác: 'border-white/15 bg-white/10 text-slate-400',
}

function productToForm(product: ProductDto): ProductFormValues {
  return {
    active: product.status === 'ACTIVE',
    category: displayCategory(product.category),
    image_url: product.image_url ?? '',
    name: product.name,
    price: product.price,
    stock: product.stock,
  }
}

function formatVnd(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message
    if (Array.isArray(message)) return message.join(', ')
    return message || error.message || 'Lỗi mạng'
  }

  return error instanceof Error ? error.message : 'Đã xảy ra lỗi'
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function FilterTab({ active, count, label, onClick }: { active: boolean; count: number; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase tracking-wide transition-all ${
        active
          ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
          : 'border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/20 hover:text-white'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-500'}`}>
        {count}
      </span>
    </button>
  )
}

function ProductFormModal({
  onClose,
  onSave,
  product,
  saving,
}: {
  onClose: () => void
  onSave: (values: ProductFormValues) => Promise<void>
  product: ProductDto | null
  saving: boolean
}) {
  const [form, setForm] = useState<ProductFormValues>(() => (product ? productToForm(product) : EMPTY_FORM))
  const isEdit = Boolean(product)

  const set = (field: keyof ProductFormValues, value: ProductFormValues[keyof ProductFormValues]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    await onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#0b1019] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1019] px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-white">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
            <p className="mt-1 text-xs text-slate-500">{isEdit ? 'Cập nhật mặt hàng bắp nước' : 'Tạo mặt hàng mới cho quầy'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Đóng"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tên sản phẩm *</span>
            <input
              required
              disabled={saving}
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50"
              placeholder="Ví dụ: Combo Couple"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Danh mục</span>
              <select
                disabled={saving}
                value={form.category}
                onChange={(event) => set('category', event.target.value as CornCategory)}
                className="w-full rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50"
              >
                {PRODUCT_CATEGORY_LABELS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Giá *</span>
              <input
                required
                min={0}
                type="number"
                disabled={saving}
                value={form.price || ''}
                onChange={(event) => set('price', Number(event.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tồn kho *</span>
              <input
                required
                min={0}
                type="number"
                disabled={saving}
                value={form.stock}
                onChange={(event) => set('stock', Number(event.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50"
              />
            </label>
            <label className="flex items-end">
              <span className="flex h-[46px] w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4">
                <input
                  type="checkbox"
                  disabled={saving}
                  checked={form.active}
                  onChange={(event) => set('active', event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-[#0b1019] text-violet-600 focus:ring-violet-500 disabled:opacity-50"
                />
                <span className="text-sm font-bold text-slate-300">Đang bán</span>
              </span>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">URL ảnh</span>
            <input
              type="url"
              disabled={saving}
              value={form.image_url}
              onChange={(event) => set('image_url', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50"
              placeholder="https://..."
            />
          </label>

          <div className="flex gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({
  deleting,
  item,
  onClose,
  onConfirm,
}: {
  deleting: boolean
  item: ProductDto
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-[#0b1019] p-8 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/25 bg-red-500/15 text-red-300">
          <TrashIcon />
        </div>
        <h3 className="mb-2 text-center text-xl font-black text-white">Xóa sản phẩm?</h3>
        <p className="mb-8 text-center text-sm text-slate-400">
          Xóa <span className="font-bold text-white">&quot;{item.name}&quot;</span>? Thao tác này không thể hoàn tác.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-400 hover:bg-white/10 disabled:opacity-50"
          >
            Hủy
          </button>
          <button type="button" onClick={() => void onConfirm()} disabled={deleting} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-500 disabled:opacity-50">
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCornPage() {
  const [rows, setRows] = useState<ProductDto[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<'all' | CornCategory>('all')
  const [filterActive, setFilterActive] = useState<'all' | 'on' | 'off'>('all')
  const [editItem, setEditItem] = useState<ProductDto | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setListError(null)
      setRows(await API_GetProducts())
    } catch (error) {
      setListError(errorMessage(error))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return rows.filter((row) => {
      const active = row.status === 'ACTIVE'
      const category = displayCategory(row.category)
      const matchSearch = !q || row.name.toLowerCase().includes(q)
      const matchCategory = filterCat === 'all' || category === filterCat
      const matchActive = filterActive === 'all' || (filterActive === 'on' && active) || (filterActive === 'off' && !active)

      return matchSearch && matchCategory && matchActive
    })
  }, [filterActive, filterCat, rows, search])

  const counts = useMemo(() => {
    const byCat = (category: CornCategory) => rows.filter((row) => displayCategory(row.category) === category).length

    return {
      all: rows.length,
      bap: byCat('Bắp'),
      combo: byCat('Combo'),
      drink: byCat('Đồ uống'),
      off: rows.filter((row) => row.status !== 'ACTIVE').length,
      on: rows.filter((row) => row.status === 'ACTIVE').length,
      other: byCat('Khác'),
    }
  }, [rows])

  const lowStock = useMemo(() => rows.filter((row) => row.status === 'ACTIVE' && row.stock > 0 && row.stock < 20).length, [rows])

  async function handleSave(values: ProductFormValues) {
    const current = editItem
    if (current === undefined) return

    try {
      setSaving(true)
      setListError(null)

      const payload = {
        category: toApiCategory(values.category),
        image_url: values.image_url.trim() || undefined,
        name: values.name.trim(),
        price: values.price,
        status: values.active ? 'ACTIVE' : 'INACTIVE',
        stock: values.stock,
      }

      if (!payload.name) throw new Error('Tên sản phẩm không được để trống')
      if (current === null) {
        const response = await API_CreateProduct(payload)
        if (!response?.success) throw new Error('Tạo sản phẩm thất bại')
      } else {
        await API_UpdateProduct(current.id, payload)
      }

      await fetchProducts()
      setEditItem(undefined)
    } catch (error) {
      alert(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    try {
      setDeleting(true)
      setListError(null)
      await API_DeleteProduct(deleteTarget.id)
      await fetchProducts()
      setDeleteTarget(null)
    } catch (error) {
      alert(errorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] px-6 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Quản lý bắp nước</h1>
            <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-violet-400">Bắp nước</span>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">Danh sách sản phẩm quầy bắp nước, đồng bộ qua API products.</p>
          </div>
          <button
            type="button"
            id="btn-add-product"
            onClick={() => setEditItem(null)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-black text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500"
          >
            <PlusIcon />
            Thêm sản phẩm
          </button>
        </div>

        {listError ? <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{listError}</div> : null}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          {[
            { label: 'Mặt hàng', value: counts.all, tone: 'text-white' },
            { label: 'Đang bán', value: counts.on, tone: 'text-emerald-300' },
            { label: 'Ngừng bán', value: counts.off, tone: 'text-slate-400' },
            { label: 'Sắp hết', value: lowStock, tone: 'text-amber-300' },
            { label: 'Bắp', value: counts.bap, tone: 'text-amber-200/90' },
            { label: 'Combo', value: counts.combo, tone: 'text-pink-300' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`text-2xl font-black ${stat.tone}`}>{stat.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b1019] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="mr-1 self-center text-[10px] font-black uppercase tracking-widest text-slate-600">Danh mục</span>
            <FilterTab active={filterCat === 'all'} label="Tất cả" count={counts.all} onClick={() => setFilterCat('all')} />
            <FilterTab active={filterCat === 'Bắp'} label="Bắp" count={counts.bap} onClick={() => setFilterCat('Bắp')} />
            <FilterTab active={filterCat === 'Đồ uống'} label="Đồ uống" count={counts.drink} onClick={() => setFilterCat('Đồ uống')} />
            <FilterTab active={filterCat === 'Combo'} label="Combo" count={counts.combo} onClick={() => setFilterCat('Combo')} />
            <FilterTab active={filterCat === 'Khác'} label="Khác" count={counts.other} onClick={() => setFilterCat('Khác')} />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
            <span className="mr-1 self-center text-[10px] font-black uppercase tracking-widest text-slate-600">Trạng thái</span>
            <FilterTab active={filterActive === 'all'} label="Tất cả" count={counts.all} onClick={() => setFilterActive('all')} />
            <FilterTab active={filterActive === 'on'} label="Đang bán" count={counts.on} onClick={() => setFilterActive('on')} />
            <FilterTab active={filterActive === 'off'} label="Ngừng bán" count={counts.off} onClick={() => setFilterActive('off')} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="overflow-x-auto">
          <div className="grid min-w-[820px] grid-cols-[2fr_1fr_1fr_1fr_1fr_.85fr] gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3">
            {['Tên', 'Danh mục', 'Giá', 'Tồn kho', 'Bán', 'Thao tác'].map((heading) => (
              <span key={heading} className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {heading}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">Đang tải danh sách...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">Không có sản phẩm phù hợp.</div>
          ) : (
            filtered.map((row) => {
              const category = displayCategory(row.category)
              const active = row.status === 'ACTIVE'

              return (
                <div key={row.id} className="grid min-w-[820px] grid-cols-[2fr_1fr_1fr_1fr_1fr_.85fr] items-center gap-3 border-b border-white/5 px-5 py-3.5 text-sm hover:bg-white/[0.03]">
                  <p className="font-bold text-white">{row.name}</p>
                  <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black ${CATEGORY_STYLES[category]}`}>{category}</span>
                  <p className="font-mono text-violet-200/90">{formatVnd(row.price)}</p>
                  <p className={row.stock === 0 ? 'font-black text-red-400' : row.stock < 20 ? 'font-bold text-amber-400' : 'text-slate-300'}>{row.stock}</p>
                  <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black ${active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-500'}`}>
                    {active ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditItem(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-600/15 text-violet-400 hover:bg-violet-600/30"
                      aria-label="Sửa"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-600/15 text-red-400 hover:bg-red-600/30"
                      aria-label="Xóa"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="border-t border-white/5 px-5 py-3 text-xs font-bold text-slate-600">
          Hiển thị {filtered.length} / {rows.length} mặt hàng
        </div>
      </div>

      {editItem !== undefined ? (
        <ProductFormModal
          key={editItem ? editItem.id : 'new'}
          product={editItem}
          saving={saving}
          onClose={() => setEditItem(undefined)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? <DeleteModal item={deleteTarget} deleting={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} /> : null}
    </section>
  )
}
