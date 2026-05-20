'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ComparePage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем сохранённую корзину
        const savedCart = localStorage.getItem('cart');
        const cartIds = savedCart ? JSON.parse(savedCart) : [];

        if (cartIds.length === 0) {
          setCartItems([]);
          return;
        }

        // Получаем все товары
        const productsRes = await fetch('/api/products');
        const allProducts = await productsRes.json();

        // Фильтруем только товары в корзине
        const cartProducts = allProducts.filter((p: any) =>
          cartIds.includes(p.id)
        );

        // Получаем магазины
        const storesRes = await fetch('/api/stores');
        const storesData = await storesRes.json();
        setStores(storesData);

        setCartItems(cartProducts);

        // Вычисляем суммы по магазинам
        const cartTotals: Record<string, number> = {};
        storesData.forEach((store: any) => {
          cartTotals[store.slug] = 0;
        });

        cartProducts.forEach((product: any) => {
          Object.entries(product.prices).forEach(([storeSlug, price]: [string, any]) => {
            if (cartTotals.hasOwnProperty(storeSlug)) {
              cartTotals[storeSlug] += price;
            }
          });
        });

        setTotals(cartTotals);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
    setTotals({});
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-white">
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
                Сравнить (0)
              </Link>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-xl text-slate-600 mb-6">Корзина пуста</p>
          <Link
            href="/catalog"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Перейти в каталог
          </Link>
        </div>
      </main>
    );
  }

  const bestStore = Object.entries(totals).reduce((best, [store, total]) =>
    total < (totals[best[0]] || Infinity) ? [store, total] : best
  )[0];

  const maxTotal = Math.max(...Object.values(totals));
  const savings = maxTotal - (totals[bestStore] || 0);
  const savingsPercent = Math.round((savings / maxTotal) * 100);

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
              Сравнить ({cartItems.length})
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Ваша корзина: {cartItems.length} товаров
          </h2>
          <p className="text-slate-600 mb-6">
            Сравнение цен в {stores.length} магазинах
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stores.map((store) => {
              const total = totals[store.slug] || 0;
              const isBest = store.slug === bestStore;
              return (
                <div
                  key={store.id}
                  className={`p-6 rounded-lg border-2 transition ${
                    isBest
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {store.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">{store.description}</p>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {total.toFixed(2)}€
                  </div>
                  {isBest && (
                    <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Экономия {savings.toFixed(2)}€ ({savingsPercent}%)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart Items */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900">Товары в корзине</h3>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Очистить корзину
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Товар
                  </th>
                  {stores.map((store) => (
                    <th
                      key={store.id}
                      className="text-center py-3 px-4 font-semibold text-slate-900"
                    >
                      {store.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cartItems.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-slate-600 text-xs">{product.unit}</p>
                      </div>
                    </td>
                    {stores.map((store) => (
                      <td
                        key={store.id}
                        className="text-center py-3 px-4 font-semibold text-slate-900"
                      >
                        {product.prices[store.slug]?.toFixed(2) || '—'}€
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    Итого:
                  </td>
                  {stores.map((store) => (
                    <td
                      key={store.id}
                      className={`text-center py-4 px-4 text-lg font-bold ${
                        store.slug === bestStore
                          ? 'text-green-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {(totals[store.slug] || 0).toFixed(2)}€
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/catalog"
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-lg font-semibold text-center"
          >
            Продолжить покупки
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Распечатать
          </button>
        </div>
      </div>
    </main>
  );
}
