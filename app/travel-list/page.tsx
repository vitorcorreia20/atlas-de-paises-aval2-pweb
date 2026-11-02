'use client';

import { useState, useEffect } from 'react';
import type { TravelItem, TravelStatus, ApiErrorResponse } from '@/types';

export default function TravelListPage() {
  const [items, setItems] = useState<TravelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de edição inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<TravelStatus>('want_to_visit');
  const [editNote, setEditNote] = useState<string>('');

  const fetchList = async () => {
    try {
      const res = await fetch('/api/travel-list');
      if (!res.ok) {
        const errData: ApiErrorResponse = await res.json();
        throw new Error(errData.error || 'Erro ao buscar países de interesse');
      }
      const data: TravelItem[] = await res.json();
      setItems(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao carregar a lista de interesse.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleStartEdit = (item: TravelItem) => {
    setEditingId(item.id);
    setEditStatus(item.status);
    setEditNote(item.note || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/travel-list/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          note: editNote.trim() || null,
        }),
      });

      if (!res.ok) {
        const errData: ApiErrorResponse = await res.json();
        throw new Error(errData.error || 'Erro ao atualizar registro');
      }

      setEditingId(null);
      fetchList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente remover este país da sua lista?')) return;

    try {
      const res = await fetch(`/api/travel-list/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok && res.status !== 204) {
        const errData: ApiErrorResponse = await res.json();
        throw new Error(errData.error || 'Erro ao remover registro');
      }

      fetchList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  return (
    <section className="space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Países de Interesse</h1>
        <p className="text-slate-600 mt-1">
          Gerencie os países que você já visitou ou planeja visitar.
        </p>
      </header>

      {loading && (
        <div className="text-center py-12 text-slate-500 font-medium" aria-live="polite">
          Carregando lista de interesse...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">
          Você ainda não cadastrou nenhum país na sua lista de interesse.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4"
            >
              {editingId === item.id ? (
                <div className="w-full space-y-3">
                  <h2 className="text-lg font-bold text-slate-800">
                    Editando: {item.name} ({item.country_code})
                  </h2>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as TravelStatus)}
                      className="border border-slate-300 rounded px-3 py-1.5 text-sm w-full sm:w-48 bg-white"
                    >
                      <option value="want_to_visit">Quero visitar</option>
                      <option value="visited">Já visitei</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Observação (máx 500 caracteres)
                    </label>
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      maxLength={500}
                      rows={2}
                      className="border border-slate-300 rounded px-3 py-1.5 text-sm w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded text-xs font-medium transition"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-1.5 rounded text-xs font-medium transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-800">{item.name}</h2>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          item.status === 'visited'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'visited' ? 'Já Visitei' : 'Quero Visitá-lo'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Código do País: {item.country_code}</p>
                    {item.note && (
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 mt-2">
                        {item.note}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="text-sm text-blue-700 hover:underline font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm text-red-600 hover:underline font-medium"
                    >
                      Remover
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
