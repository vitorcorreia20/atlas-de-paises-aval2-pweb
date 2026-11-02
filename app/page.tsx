'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import type { CountrySummary, ApiErrorResponse } from '@/types';

export default function CatalogPage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState<string>('');
  const [continentInput, setContinentInput] = useState<string>('all');

  const fetchCountries = async (name = '', continent = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      if (continent && continent !== 'all') params.append('continent', continent);

      const res = await fetch(`/api/countries?${params.toString()}`);

      if (!res.ok) {
        const errData: ApiErrorResponse = await res.json();
        throw new Error(errData.error || 'Erro ao carregar lista de países');
      }

      const data: CountrySummary[] = await res.json();
      setCountries(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado ao buscar os países.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchCountries(nameInput, continentInput);
  };

  return (
    <section className="space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Explorar Países</h1>
        <p className="text-slate-600 mt-1">
          Consulte dados globais integrados via API do IBGE.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <label htmlFor="name-search" className="block text-sm font-medium text-slate-700 mb-1">
            Nome do País
          </label>
          <input
            id="name-search"
            type="text"
            placeholder="Ex: Japão, Brasil, França..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="w-full sm:w-56">
          <label htmlFor="continent-select" className="block text-sm font-medium text-slate-700 mb-1">
            Continente
          </label>
          <select
            id="continent-select"
            value={continentInput}
            onChange={(e) => setContinentInput(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            <option value="all">Todos os continentes</option>
            <option value="América">América</option>
            <option value="Europa">Europa</option>
            <option value="Ásia">Ásia</option>
            <option value="África">África</option>
            <option value="Oceania">Oceania</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-medium px-5 py-2 rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Filtrar
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-12 text-slate-500 font-medium" aria-live="polite">
          Carregando lista de países...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && countries.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border text-slate-500">
          Nenhum país encontrado para os filtros pesquisados.
        </div>
      )}

      {!loading && !error && countries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {countries.map((c) => (
            <article
              key={c.code}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {c.continent}
                </span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">{c.name}</h2>
                <p className="text-xs text-slate-400 mt-1">Código ISO: {c.code}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <Link
                  href={`/countries/${c.code}`}
                  className="inline-block text-sm font-semibold text-blue-700 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  Ver detalhes e indicadores &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
