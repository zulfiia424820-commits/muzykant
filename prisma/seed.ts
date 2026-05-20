import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Создаём магазины
  const stores = await Promise.all([
    prisma.store.upsert({
      where: { slug: 'lidl' },
      update: {},
      create: {
        name: 'Lidl',
        slug: 'lidl',
        description: 'Качество по низким ценам',
      },
    }),
    prisma.store.upsert({
      where: { slug: 'mercadona' },
      update: {},
      create: {
        name: 'Mercadona',
        slug: 'mercadona',
        description: 'Любимый магазин испанцев',
      },
    }),
    prisma.store.upsert({
      where: { slug: 'hiperdino' },
      update: {},
      create: {
        name: 'HiperDino',
        slug: 'hiperdino',
        description: 'Гордость Канарских островов',
      },
    }),
  ]);

  // Создаём категории
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'dairy' },
      update: {},
      create: { name: 'Молочные продукты', slug: 'dairy', icon: '🥛' },
    }),
    prisma.category.upsert({
      where: { slug: 'bakery' },
      update: {},
      create: { name: 'Хлеб и выпечка', slug: 'bakery', icon: '🍞' },
    }),
    prisma.category.upsert({
      where: { slug: 'meat' },
      update: {},
      create: { name: 'Мясо', slug: 'meat', icon: '🥩' },
    }),
    prisma.category.upsert({
      where: { slug: 'fish' },
      update: {},
      create: { name: 'Рыба и морепродукты', slug: 'fish', icon: '🐟' },
    }),
    prisma.category.upsert({
      where: { slug: 'produce' },
      update: {},
      create: { name: 'Овощи и фрукты', slug: 'produce', icon: '🥕' },
    }),
    prisma.category.upsert({
      where: { slug: 'bakery-goods' },
      update: {},
      create: { name: 'Бакалея', slug: 'bakery-goods', icon: '🥫' },
    }),
    prisma.category.upsert({
      where: { slug: 'beverages' },
      update: {},
      create: { name: 'Напитки', slug: 'beverages', icon: '🥤' },
    }),
    prisma.category.upsert({
      where: { slug: 'frozen' },
      update: {},
      create: { name: 'Замороженные товары', slug: 'frozen', icon: '❄️' },
    }),
    prisma.category.upsert({
      where: { slug: 'household' },
      update: {},
      create: { name: 'Бытовая химия', slug: 'household', icon: '🧹' },
    }),
    prisma.category.upsert({
      where: { slug: 'sweets' },
      update: {},
      create: { name: 'Кондитерские изделия', slug: 'sweets', icon: '🍫' },
    }),
  ]);

  console.log('✅ Магазины и категории созданы!');

  // Для примера создам 10 товаров, остальное будет автоматическое
  const sampleProducts = [
    {
      name: 'Молоко 1л',
      category: 'dairy',
      unit: 'л',
      prices: { 'lidl': 0.89, 'mercadona': 0.95, 'hiperdino': 1.20 },
    },
    {
      name: 'Йогурт натуральный 500г',
      category: 'dairy',
      unit: 'г',
      prices: { 'lidl': 1.99, 'mercadona': 2.10, 'hiperdino': 2.50 },
    },
    {
      name: 'Пицца замороженная Маргарита 350г',
      category: 'frozen',
      unit: 'г',
      prices: { 'lidl': 1.99, 'mercadona': 2.20, 'hiperdino': 4.89 },
    },
    {
      name: 'Средство для посуды 1л',
      category: 'household',
      unit: 'л',
      prices: { 'lidl': 1.29, 'mercadona': 1.25, 'hiperdino': 6.99 },
    },
    {
      name: 'Шоколад молочный 100г',
      category: 'sweets',
      unit: 'г',
      prices: { 'lidl': 0.85, 'mercadona': 1.05, 'hiperdino': 1.51 },
    },
    {
      name: 'Соль морская 1кг',
      category: 'bakery-goods',
      unit: 'кг',
      prices: { 'lidl': 0.39, 'mercadona': 0.40, 'hiperdino': 0.66 },
    },
    {
      name: 'Вино сухое 0.75л',
      category: 'beverages',
      unit: 'л',
      prices: { 'lidl': 3.50, 'mercadona': 1.15, 'hiperdino': 3.25 },
    },
    {
      name: 'Хамон Серрано нарезка 100г',
      category: 'meat',
      unit: 'г',
      prices: { 'lidl': 1.79, 'mercadona': 4.10, 'hiperdino': 1.65 },
    },
    {
      name: 'Оливковое масло 500мл',
      category: 'bakery-goods',
      unit: 'мл',
      prices: { 'lidl': 4.99, 'mercadona': 5.20, 'hiperdino': 6.50 },
    },
    {
      name: 'Помидоры свежие кг',
      category: 'produce',
      unit: 'кг',
      prices: { 'lidl': 1.50, 'mercadona': 1.75, 'hiperdino': 2.00 },
    },
  ];

  for (const productData of sampleProducts) {
    const category = categories.find((c) => c.slug === productData.category);
    if (!category) continue;

    const product = await prisma.product.upsert({
      where: { name_categoryId: { name: productData.name, categoryId: category.id } },
      update: {},
      create: {
        name: productData.name,
        unit: productData.unit,
        categoryId: category.id,
      },
    });

    // Создаём цены для каждого магазина
    for (const [storeSlug, price] of Object.entries(productData.prices)) {
      const store = stores.find((s) => s.slug === storeSlug);
      if (!store) continue;

      await prisma.price.upsert({
        where: { productId_storeId: { productId: product.id, storeId: store.id } },
        update: { price },
        create: { productId: product.id, storeId: store.id, price },
      });
    }
  }

  console.log('✅ 10 товаров загружены!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
