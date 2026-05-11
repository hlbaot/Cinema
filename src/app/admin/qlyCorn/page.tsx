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
