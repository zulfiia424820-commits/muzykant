'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CatalogContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category');
  const store = searchParams.get('store');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = new URL('/api/products', window.location.origin);
        if (category) url.searchParams.set('category', category);
        if (store) url.searchParams.set('store', store);

        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, store]);

  const toggleCart = (productId: number) => {
    const newCart = new Set(cart);
    if (newCart.has(productId)) {
      newCart.delete(productId);
    } else {
      newCart.add(productId);
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(Array.from(newCart)));
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">¢</div>
            <h1 className="text-xl font-bold text-slate-900">Сравни цены</h1>
          </Link>
          <nav className="flex gap-6">
            <Link href="/catalog" className="text-slate-600 hover:text-slate-900 font-medium">
              Каталог
            </Link>
            <Link href="/compare" className="text-slate-600 hover:text-slate-900 font-medium">
              Сравнить ({cart.size})
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            {category ? `Категория: ${category}` : 'Каталог товаров'}
          </h2>
          <p className="text-slate-600 mt-2">
            Добавляйте товары в корзину для сравнения цен
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Загрузка товаров...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Товары не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{product.unit}</p>

                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-slate-600 mb-1">Лучшая цена</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {product.bestPrice}€
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      в {product.bestStore.name}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {Object.entries(product.prices).map(([storeSlug, price]: [string, any]) => (
                      <div key={storeSlug} className="flex justify-between text-sm">
                        <span className="text-slate-600 capitalize">{storeSlug}</span>
                        <span className="font-semibold text-slate-900">{price}€</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => toggleCart(product.id)}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      cart.has(product.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {cart.has(product.id) ? '✓ В корзине' : 'Добавить'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Загрузка...</p></div>}>
      <CatalogContent />
    </Suspense>
  );
}
