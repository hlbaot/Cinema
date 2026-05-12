
'use client'

import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  API_CreateProduct,
  API_DeleteProduct,
  API_GetProducts,
  API_UpdateProduct,
  displayCategory,
  PRODUCT_CATEGORY_LABELS,
  type ProductCategoryLabel,
  type ProductDto,
  toApiCategory,
} from '@/src/api/API_Product'

type CornCategory = ProductCategoryLabel

const CATEGORY_STYLES: Record<CornCategory, string> = {
  Bắp: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  'Đồ uống': 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  Combo: 'bg-pink-500/15 text-pink-300 border-pink-500/25',
  Khác: 'bg-white/10 text-slate-400 border-white/15',
}

interface ProductFormValues {
  name: string
  category: CornCategory
  price: number
  stock: number
  image_url: string
  active: boolean
}

const EMPTY_FORM: ProductFormValues = {
  name: '',
  category: 'Bắp',
  price: 0,
  stock: 0,
  image_url: '',
  active: true,
}

function productToForm(p: ProductDto): ProductFormValues {
  return {
    name: p.name,
    category: displayCategory(p.category),
    price: p.price,
    stock: p.stock,
    image_url: p.image_url ?? '',
    active: p.status === 'ACTIVE',
  }
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ'
}

function errMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { message?: string | string[] } | undefined
    const m = data?.message
    if (Array.isArray(m)) return m.join(', ')
    if (typeof m === 'string') return m
    return e.message || 'Lỗi mạng'
  }
  if (e instanceof Error) return e.message
  return 'Đã xảy ra lỗi'
}

function FilterTab({ active, count, label, onClick }: { active: boolean; count: number; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase tracking-wide transition-all ${
        active ? 'border-violet-500/40 bg-violet-500/15 text-violet-300' : 'border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/20 hover:text-white'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-500'}`}>{count}</span>
    </button>
  )
}

function ProductFormModal({
  product,
  saving,
  onClose,
  onSave,
}: {
  product: ProductDto | null
  saving: boolean
  onClose: () => void
  onSave: (values: ProductFormValues) => Promise<void>
}) {
  const isEdit = !!product
  const [form, setForm] = useState<ProductFormValues>(() => (product ? productToForm(product) : EMPTY_FORM))
  const set = (field: keyof ProductFormValues, val: unknown) => setForm(f => ({ ...f, [field]: val }))

  useEffect(() => {
    setForm(product ? productToForm(product) : EMPTY_FORM)
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0b1019] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1019] px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-white">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
            <p className="mt-1 text-xs text-slate-500">{isEdit ? 'Cập nhật thông tin mặt hàng' : 'Nhập thông tin mặt hàng mới'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Tên sản phẩm *</label>
            <input
              required
              disabled={saving}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ví dụ: Bắp caramel lớn"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Danh mục</label>
            <select
              disabled={saving}
              value={form.category}
              onChange={e => set('category', e.target.value as CornCategory)}
              className="w-full rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50"
            >
              {PRODUCT_CATEGORY_LABELS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Giá (đ) *</label>
              <input
                type="number"
                required
                min={0}
                disabled={saving}
                value={form.price || ''}
                onChange={e => set('price', Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Tồn kho *</label>
              <input
                type="number"
                required
                min={0}
                disabled={saving}
                value={form.stock}
                onChange={e => set('stock', Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">URL ảnh (tuỳ chọn)</label>
            <input
              type="url"
              disabled={saving}
              value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 disabled:opacity-50"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <input
              type="checkbox"
              disabled={saving}
              checked={form.active}
              onChange={e => set('active', e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-[#0b1019] text-violet-600 focus:ring-violet-500 disabled:opacity-50"
            />
            <span className="text-sm font-bold text-slate-300">Đang bán</span>
          </label>

          <div className="flex gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"

"use client";

import Image from "next/image";
import { CupSoda, PackagePlus, Pen, Plus, Popcorn, Trash2 } from "lucide-react";
import { useState } from "react";

type ConcessionCategory = "Bắp" | "Nước" | "Combo";

type ConcessionItem = {
  category: ConcessionCategory;
  description: string;
  id: number;
  image: string;
  price: number;
  status: string;
  title: string;
};

const concessionItems: ConcessionItem[] = [
  {
    category: "Bắp",
    description: "Bắp rang bơ size lớn, phù hợp cho 2 người.",
    id: 1,
    image:
      "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=1200",
    price: 69000,
    status: "Đang bán",
    title: "Bắp rang bơ lớn",
  },
  {
    category: "Nước",
    description: "Pepsi lạnh size M, dùng kèm vé xem phim.",
    id: 2,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1200",
    price: 39000,
    status: "Đang bán",
    title: "Nước ngọt Pepsi",
  },
  {
    category: "Combo",
    description: "01 bắp lớn và 02 nước ngọt cho cặp đôi.",
    id: 3,
    image:
      "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=1200",
    price: 129000,
    status: "Đang bán",
    title: "Combo Couple",
  },
  {
    category: "Bắp",
    description: "Bắp caramel giòn ngọt, đóng hộp tiện mang vào rạp.",
    id: 4,
    image:
      "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=1200",
    price: 79000,
    status: "Sắp hết",
    title: "Bắp caramel",
  },
  {
    category: "Nước",
    description: "Trà đào cam sả mát lạnh, size L.",
    id: 5,
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=1200",
    price: 49000,
    status: "Đang bán",
    title: "Trà đào cam sả",
  },
  {
    category: "Combo",
    description: "02 bắp vừa, 04 nước ngọt và snack cho nhóm bạn.",
    id: 6,
    image:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=1200",
    price: 219000,
    status: "Đang bán",
    title: "Combo Family",
  },
];

const categoryBadgeClass: Record<ConcessionCategory, string> = {
  Bắp: "bg-yellow-500/20 text-yellow-300",
  Nước: "bg-blue-500/20 text-blue-300",
  Combo: "bg-purple-500/20 text-purple-300",
};

const statusBadgeClass: Record<string, string> = {
  "Đang bán": "bg-green-500/20 text-green-300",
  "Sắp hết": "bg-orange-500/20 text-orange-300",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

function CategoryIcon({ category }: { category: ConcessionCategory }) {
  if (category === "Bắp") {
    return <Popcorn className="h-5 w-5" />;
  }

  if (category === "Nước") {
    return <CupSoda className="h-5 w-5" />;
  }

  return <PackagePlus className="h-5 w-5" />;
}

type ComboFormModalProps = {
  item?: ConcessionItem | null;
  mode: "add" | "edit";
  onClose: () => void;
  open: boolean;
};

function ComboFormModal({ item, mode, onClose, open }: ComboFormModalProps) {
  if (!open) {
    return null;
  }

  const title = mode === "add" ? "Thêm combo bắp nước" : "Chỉnh sửa bắp nước";
  const submitText = mode === "add" ? "Thêm mới" : "Cập nhật";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/80 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="combo-form-title"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-gray-900 p-5 text-white shadow-2xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="combo-form-title" className="mb-4 text-xl font-bold">
          {title}
        </h3>
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Tên sản phẩm / combo</label>
            <input
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              defaultValue={item?.title}
              placeholder="VD: Combo Couple"
              type="text"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Loại</label>
              <select
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={item?.category ?? "Combo"}
              >
                <option>Bắp</option>
                <option>Nước</option>
                <option>Combo</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Giá bán</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={item?.price}
                placeholder="129000"
                type="number"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Mô tả</label>
            <textarea
              className="min-h-24 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              defaultValue={item?.description}
              placeholder="Nhập mô tả ngắn cho combo"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Link ảnh demo</label>
            <input
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              defaultValue={item?.image}
              placeholder="https://..."
              type="url"
            />
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-700 py-2 transition hover:bg-gray-600"

            >
              Hủy
            </button>
            <button

              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50"
            >
              {saving ? 'Đang lưu…' : isEdit ? 'Lưu' : 'Thêm'}

              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 transition hover:opacity-90"
            >
              {submitText}

            </button>
          </div>
        </form>
      </div>
    </div>

  )
}

function DeleteModal({
  item,
  deleting,
  onClose,
  onConfirm,
}: {
  item: ProductDto
  deleting: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0b1019] p-8 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/25 bg-red-500/15">
          <TrashIcon />
        </div>
        <h3 className="mb-2 text-center text-xl font-black text-white">Xóa sản phẩm?</h3>
        <p className="mb-8 text-center text-sm text-slate-400">
          Xóa <span className="font-bold text-white">&quot;{item.name}&quot;</span>? Thao tác không hoàn tác.
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
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-500 disabled:opacity-50"
          >
            {deleting ? 'Đang xóa…' : 'Xóa'}
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
  const searchRef = useRef<HTMLInputElement>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setListError(null)
      const list = await API_GetProducts()
      setRows(list)
    } catch (e) {
      setListError(errMessage(e))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => {
      const match = r.name.toLowerCase().includes(q)
      const label = displayCategory(r.category)
      const catOk = filterCat === 'all' || label === filterCat
      const active = r.status === 'ACTIVE'
      const actOk = filterActive === 'all' || (filterActive === 'on' && active) || (filterActive === 'off' && !active)
      return match && catOk && actOk
    })
  }, [rows, search, filterCat, filterActive])

  const counts = useMemo(() => {
    const byCat = (c: CornCategory) => rows.filter(r => displayCategory(r.category) === c).length
    return {
      all: rows.length,
      on: rows.filter(r => r.status === 'ACTIVE').length,
      off: rows.filter(r => r.status !== 'ACTIVE').length,
      bap: byCat('Bắp'),
      drink: byCat('Đồ uống'),
      combo: byCat('Combo'),
      other: byCat('Khác'),
    }
  }, [rows])

  const lowStock = useMemo(
    () => rows.filter(r => r.status === 'ACTIVE' && r.stock > 0 && r.stock < 20).length,
    [rows]
  )

  const handleSave = async (values: ProductFormValues) => {
    const editing = editItem
    if (editing === undefined) return
    try {
      setSaving(true)
      setListError(null)
      const payload = {
        name: values.name.trim(),
        category: toApiCategory(values.category),
        price: values.price,
        stock: values.stock,
        image_url: values.image_url.trim() || undefined,
        status: values.active ? 'ACTIVE' : 'INACTIVE',
      }
      if (editing === null) {
        const res = await API_CreateProduct(payload)
        if (!res?.success) throw new Error('Tạo sản phẩm thất bại')
      } else {
        await API_UpdateProduct(editing.id, payload)
      }
      await fetchProducts()
      setEditItem(undefined)
    } catch (e) {
      alert(errMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setListError(null)
      await API_DeleteProduct(deleteTarget.id)
      await fetchProducts()
      setDeleteTarget(null)
    } catch (e) {
      alert(errMessage(e))
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
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Danh sách và CRUD qua API <code className="text-slate-400">/api/v1/products</code>. Cần đăng nhập (token/cookie) nếu backend trả 401.
            </p>
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
        {listError && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{listError}</div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          {[
            { label: 'Mặt hàng', value: counts.all, tone: 'text-white' },
            { label: 'Đang bán', value: counts.on, tone: 'text-emerald-300' },
            { label: 'Ngừng bán', value: counts.off, tone: 'text-slate-400' },
            { label: 'Sắp hết (dưới 20)', value: lowStock, tone: 'text-amber-300' },
            { label: 'Bắp', value: counts.bap, tone: 'text-amber-200/90' },
            { label: 'Combo', value: counts.combo, tone: 'text-pink-300' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
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
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
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
            {['Tên', 'Danh mục', 'Giá', 'Tồn kho', 'Bán', 'Thao tác'].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {h}
              </span>
            ))}
          </div>
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">Đang tải danh sách…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">Không có sản phẩm phù hợp.</div>
          ) : (
            filtered.map(r => {
              const catLabel = displayCategory(r.category)
              const active = r.status === 'ACTIVE'
              return (
                <div
                  key={r.id}
                  className="grid min-w-[820px] grid-cols-[2fr_1fr_1fr_1fr_1fr_.85fr] items-center gap-3 border-b border-white/5 px-5 py-3.5 text-sm hover:bg-white/[0.03]"
                >
                  <p className="font-bold text-white">{r.name}</p>
                  <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black ${CATEGORY_STYLES[catLabel]}`}>{catLabel}</span>
                  <p className="font-mono text-violet-200/90">{formatVnd(r.price)}</p>
                  <p className={r.stock === 0 ? 'font-black text-red-400' : r.stock < 20 ? 'font-bold text-amber-400' : 'text-slate-300'}>{r.stock}</p>
                  <span
                    className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black ${
                      active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-500'
                    }`}
                  >
                    {active ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditItem(r)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-600/15 text-violet-400 hover:bg-violet-600/30"
                      aria-label="Sửa"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(r)}
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

      {editItem !== undefined && (
        <ProductFormModal
          key={editItem ? editItem.id : 'new'}
          product={editItem}
          saving={saving}
          onClose={() => setEditItem(undefined)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteModal item={deleteTarget} deleting={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
    </section>
  )

  );
}

export default function AdminCornPage() {
  const [addComboModalOpen, setAddComboModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConcessionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ConcessionItem | null>(null);

  return (
    <>
      <main className="flex h-full min-w-0 flex-1 flex-col bg-black text-white">
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-800/50 bg-gray-900/20 px-4 py-4 md:px-8">
            <div>
              <h3 className="text-lg font-bold text-white">Quản lý bắp nước</h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] uppercase text-gray-500">Dashboard</span>
                <span className="text-[10px] text-gray-600">/</span>
                <span className="text-[10px] font-bold uppercase text-purple-400">Quản lý bắp nước</span>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-gray-500">Hôm nay, 11/05/2026</p>
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
                    <PackagePlus className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">Thanh thêm combo bắp nước</p>
                    <p className="mt-0.5 text-sm text-gray-400">
                      Tạo nhanh combo mới cho quầy bán hàng trong rạp.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddComboModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-500/50 px-4 py-2 font-medium text-purple-300 transition hover:bg-purple-500/10 md:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Tạo combo mới
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {concessionItems.map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur transition hover:border-purple-500/50"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-800">
                      <Image
                        alt={item.title}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        src={item.image}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur ${categoryBadgeClass[item.category]}`}
                        >
                          <CategoryIcon category={item.category} />
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute right-3 top-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="rounded-lg bg-gray-900/80 p-2 text-white shadow-lg backdrop-blur transition hover:bg-blue-600"
                          title="Chỉnh sửa"
                          aria-label={`Chỉnh sửa ${item.title}`}
                        >
                          <Pen className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="rounded-lg bg-gray-900/80 p-2 text-white shadow-lg backdrop-blur transition hover:bg-red-600"
                          title="Xóa"
                          aria-label={`Xóa ${item.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="line-clamp-1 text-lg font-bold text-white">{item.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-purple-200">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <div className="space-y-4 p-4">
                      <p className="line-clamp-2 min-h-10 text-sm leading-5 text-gray-400">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className={`rounded-full px-3 py-1 ${statusBadgeClass[item.status] ?? statusBadgeClass["Đang bán"]}`}>
                          {item.status}
                        </span>
                        <span className="rounded-full bg-gray-800 px-3 py-1 text-gray-300">
                          Mã SP: BN{item.id.toString().padStart(3, "0")}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ComboFormModal mode="add" open={addComboModalOpen} onClose={() => setAddComboModalOpen(false)} />
      <ComboFormModal
        item={editingItem}
        mode="edit"
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
      />

      {deletingItem ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-combo-title"
          onMouseDown={() => setDeletingItem(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-gray-100 p-6 text-gray-950 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h3 id="delete-combo-title" className="text-xl font-bold">
              Xác nhận xóa
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Bạn có chắc muốn xóa <span className="font-semibold text-gray-950">{deletingItem.title}</span> không?
              Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-500"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

}
