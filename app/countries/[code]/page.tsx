'use client';

import { useState, useEffect, FormEvent, use } from 'react';
import Link from 'next/link';
import type { CountryDetail, TravelStatus, ApiErrorResponse } from '@/types';

export default function CountryDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  const [country, setCountry] = useState<CountryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<TravelStatus>('want_to_visit');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/countries/${code}`);
        if (!res.ok) {
          const errData: ApiErrorResponse = await res.json();
          throw new Error(errData.error || 'Erro ao obter informações do país');
        }
        const data: CountryDetail = await res.json();
        setCountry(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro inesperado ao carregar os dados.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [code]);

  const handleAddToList = async (e: FormEvent) => {
    e.preventDefault();
    if (!country) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/travel-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_code: country.code,
          name: country.name,
          status,
          note: note.trim() || null,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Erro ao adicionar país à lista.');
      }

      setFeedback({
        type: 'success',
        message: 'País adicionado à sua lista de interesse com sucesso!',
      });
      setNote('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFeedback({ type: 'error', message: err.message });
      } else {
        setFeedback({ type: 'error', message: 'Erro desconhecido ao salvar.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500 font-medium" aria-live="polite">
        Carregando informações do país...
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md" role="alert">
          {error || 'País não encontrado.'}
        </div>
        <Link href="/" className="inline-block text-blue-700 underline hover:text-blue-900">
          &larr; Voltar para a busca
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-blue-700 hover:underline mb-2 inline-block">
          &larr; Voltar para a busca
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">
          {country.name} <span className="text-slate-400 font-normal">({country.code})</span>
        </h1>
        <p className="text-slate-600 mt-1">
          {country.continent} &bull; Sub-região: {country.subRegion}
        </p>
      </div>

      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Capital</h2>
          <p className="text-lg font-medium text-slate-800 mt-1">{country.capital}</p>
        </div>
        <div>
          <h2 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Área Territorial</h2>
          <p className="text-lg font-medium text-slate-800 mt-1">
            {country.areaKm2 > 0 ? `${country.areaKm2.toLocaleString('pt-BR')} km²` : 'Não informada'}
          </p>
        </div>
        <div>
          <h2 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Densidade Demográfica</h2>
          <p className="text-lg font-medium text-slate-800 mt-1">
            {country.demographicDensity !== null ? `${country.demographicDensity} hab/km²` : 'N/A'}
          </p>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Indicadores Socioeconômicos (IBGE)</h2>
        {country.indicators.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhum indicador disponível para este país.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {country.indicators.map((ind, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <p className="text-sm font-semibold text-slate-700">{ind.name}</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">{ind.value}</p>
                <p className="text-xs text-slate-400 mt-1">Ano de referência: {ind.year}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Adicionar aos Países de Interesse</h2>

        {feedback && (
          <div
            className={`p-3 mb-4 rounded text-sm ${
              feedback.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
            role="alert"
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleAddToList} className="space-y-4">
          <div>
            <label htmlFor="status-select" className="block text-sm font-medium text-slate-700 mb-1">
              Status da Viagem
            </label>
            <select
              id="status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as TravelStatus)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="want_to_visit">Quero visitar</option>
              <option value="visited">Já visitei</option>
            </select>
          </div>

          <div>
            <label htmlFor="note-textarea" className="block text-sm font-medium text-slate-700 mb-1">
              Observação (opcional, máximo 500 caracteres)
            </label>
            <textarea
              id="note-textarea"
              maxLength={500}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Roteiro gastronômico, passeios culturais..."
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium px-5 py-2 rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {submitting ? 'Salvando...' : 'Salvar País'}
          </button>
        </form>
      </section>
    </article>
  );
}
