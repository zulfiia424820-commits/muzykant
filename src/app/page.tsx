'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type TabKey = 'scenario' | 'lesson' | 'song' | 'game';

type FormState = {
  scenario: {
    theme: string;
    ageGroup: string;
    duration: string;
    groupSize: string;
  };
  lesson: {
    subject: string;
    goals: string;
    duration: string;
    materials: string;
  };
  song: {
    title: string;
    mood: string;
    lyricsHint: string;
    duration: string;
  };
  game: {
    name: string;
    objective: string;
    participants: string;
    equipment: string;
  };
};

const tabLabels: Record<TabKey, string> = {
  scenario: "Сценарий утренника",
  lesson: "План занятий",
  song: "Песня/речёвка",
  game: "Игра",
};

const initialForm: FormState = {
  scenario: {
    theme: "Тема праздника",
    ageGroup: "3-5 лет",
    duration: "15",
    groupSize: "20",
  },
  lesson: {
    subject: "Музыкальные игры",
    goals: "Развитие ритма и слуха",
    duration: "20",
    materials: "барабаны, маракасы",
  },
  song: {
    title: "Песня-кружок",
    mood: "Весёлая",
    lyricsHint: "Короткая контактная песенка с движениями",
    duration: "5",
  },
  game: {
    name: "Ритмическая эстафета",
    objective: "Развитие внимания и координации",
    participants: "10-30",
    equipment: "шарики, скакалки",
  },
};


export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("scenario");
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const currentForm = formData[activeTab] as any;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    } as FormState));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, payload: currentForm }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Ошибка сервера");
      }

      setResult(data.content);
    } catch (err: any) {
      setError(err.message ?? "Не удалось сформировать содержимое.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-6xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">
              Музыкальный руководитель
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Локальный генератор сценариев и занятий
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Приложение работает полностью на компьютере без внешнего ключа и удалённого сервера.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap gap-2">
            {(Object.keys(tabLabels) as TabKey[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-slate-900">{tabLabels[activeTab]}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Заполните параметры и нажмите «Создать».
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {activeTab === "scenario" && (
                  <>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Тема</span>
                      <input
                        value={currentForm.theme}
                        onChange={(event) => handleChange("theme", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Возрастная группа</span>
                      <input
                        value={currentForm.ageGroup}
                        onChange={(event) => handleChange("ageGroup", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Продолжительность (мин.)</span>
                      <input
                        type="number"
                        min="5"
                        value={currentForm.duration}
                        onChange={(event) => handleChange("duration", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Размер группы</span>
                      <input
                        type="number"
                        min="1"
                        value={currentForm.groupSize}
                        onChange={(event) => handleChange("groupSize", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                  </>
                )}

                {activeTab === "lesson" && (
                  <>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Тема занятия</span>
                      <input
                        value={currentForm.subject}
                        onChange={(event) => handleChange("subject", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Цели</span>
                      <textarea
                        value={currentForm.goals}
                        onChange={(event) => handleChange("goals", event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Продолжительность (мин.)</span>
                      <input
                        type="number"
                        min="5"
                        value={currentForm.duration}
                        onChange={(event) => handleChange("duration", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Материалы</span>
                      <input
                        value={currentForm.materials}
                        onChange={(event) => handleChange("materials", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                  </>
                )}

                {activeTab === "song" && (
                  <>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Название</span>
                      <input
                        value={currentForm.title}
                        onChange={(event) => handleChange("title", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Настроение</span>
                      <input
                        value={currentForm.mood}
                        onChange={(event) => handleChange("mood", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Подсказка для слов/речёвки</span>
                      <textarea
                        value={currentForm.lyricsHint}
                        onChange={(event) => handleChange("lyricsHint", event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Продолжительность (мин.)</span>
                      <input
                        type="number"
                        min="1"
                        value={currentForm.duration}
                        onChange={(event) => handleChange("duration", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                  </>
                )}

                {activeTab === "game" && (
                  <>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Название игры</span>
                      <input
                        value={currentForm.name}
                        onChange={(event) => handleChange("name", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Цель</span>
                      <textarea
                        value={currentForm.objective}
                        onChange={(event) => handleChange("objective", event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Количество участников</span>
                      <input
                        value={currentForm.participants}
                        onChange={(event) => handleChange("participants", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Оборудование</span>
                      <input
                        value={currentForm.equipment}
                        onChange={(event) => handleChange("equipment", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Нажмите «Создать», чтобы сформировать текст локально.
                </p>
                {loading && <p className="mt-2 text-sm text-indigo-600">⏳ AI генерирует... обычно 5–10 секунд</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Создать
              </button>
            </div>
          </form>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Результат</h3>
              <pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{result}</pre>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
