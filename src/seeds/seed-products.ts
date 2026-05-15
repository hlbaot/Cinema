import 'dotenv/config';
import 'reflect-metadata';
import appDataSource from 'src/config/database.config';
import { Product } from 'src/product/entities/product.entity';
import { ProductCategory, ProductStatus } from 'src/product/enums/product.enum';

type ProductSeed = Pick<Product, 'name' | 'category' | 'price' | 'stock' | 'image_url' | 'status'>;

const products: ProductSeed[] = [
  {
    name: 'Combo Bắp Nước Classic',
    category: ProductCategory.COMBO,
    price: 79000,
    stock: 120,
    image_url: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Combo Couple',
    category: ProductCategory.COMBO,
    price: 129000,
    stock: 80,
    image_url: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Combo Family',
    category: ProductCategory.COMBO,
    price: 189000,
    stock: 60,
    image_url: 'https://images.unsplash.com/photo-1622577743097-9f671b1e5b42?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Bắp Rang Bơ Lớn',
    category: ProductCategory.FOOD,
    price: 59000,
    stock: 150,
    image_url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Bắp Caramel',
    category: ProductCategory.FOOD,
    price: 69000,
    stock: 100,
    image_url: 'https://images.unsplash.com/photo-1619985632461-f33748ef8f3c?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Nachos Phô Mai',
    category: ProductCategory.FOOD,
    price: 65000,
    stock: 90,
    image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Coca-Cola 32oz',
    category: ProductCategory.DRINK,
    price: 39000,
    stock: 200,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Sprite 32oz',
    category: ProductCategory.DRINK,
    price: 39000,
    stock: 180,
    image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Trà Đào Cam Sả',
    category: ProductCategory.DRINK,
    price: 49000,
    stock: 120,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Ly Sưu Tầm CinePro',
    category: ProductCategory.MERCHANDISE,
    price: 99000,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Móc Khóa Nhân Vật',
    category: ProductCategory.MERCHANDISE,
    price: 69000,
    stock: 70,
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Combo Limited Marvel',
    category: ProductCategory.COMBO,
    price: 229000,
    stock: 0,
    image_url: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=900&q=80',
    status: ProductStatus.OUT_OF_STOCK,
  },
];

async function seedProducts() {
  await appDataSource.initialize();
  const productRepository = appDataSource.getRepository(Product);

  let created = 0;
  let updated = 0;

  for (const seed of products) {
    const existing = await productRepository.findOne({ where: { name: seed.name } });
    if (existing) {
      productRepository.merge(existing, seed);
      await productRepository.save(existing);
      updated += 1;
      continue;
    }

    await productRepository.save(productRepository.create(seed));
    created += 1;
  }

  await appDataSource.destroy();
  console.log(`Seed products completed. Created: ${created}, updated: ${updated}.`);
}

seedProducts().catch(async (error) => {
  console.error('Seed products failed:', error);
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
  }
  process.exit(1);
});
