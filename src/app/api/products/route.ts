import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const store = url.searchParams.get('store');
    const search = url.searchParams.get('search');

    let where: any = {};

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        prices: {
          include: { store: true },
        },
      },
      take: 50,
    });

    // Трансформируем данные для клиента
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      unit: product.unit,
      category: product.category,
      prices: product.prices.reduce(
        (acc, price) => {
          acc[price.store.slug] = price.price;
          return acc;
        },
        {} as Record<string, number>
      ),
      bestPrice: Math.min(...product.prices.map((p) => p.price)),
      bestStore: product.prices.reduce((min, p) =>
        p.price < min.price ? p : min
      ).store,
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
