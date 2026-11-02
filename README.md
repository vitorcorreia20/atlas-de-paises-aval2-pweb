# 🌐 Atlas de Países

Aplicação web desenvolvida com **Next.js (App Router)**, **React**, **TypeScript** e **SQLite local** para consulta de dados demográficos globais da API pública do IBGE e gerenciamento de lista de interesses de viagem.

---

## 👥 Integrantes da Equipe
- **Integrante 1**: [Nome do Colega]
- **Integrante 2**: [Seu Nome]

---

## 🚀 Tecnologias Utilizadas
- **Framework**: Next.js 14/15 (App Router)
- **Biblioteca UI**: React 18/19
- **Linguagem**: TypeScript em modo estrito (`"strict": true`)
- **Estilização**: Tailwind CSS
- **Banco de Dados**: SQLite via `better-sqlite3` (Modo WAL desativado com `PRAGMA journal_mode = DELETE`)

---

## 📋 Funcionalidades Principais
1. **Catalogação & Filtros**: Busca por nome (sem distinção de acentos ou maiúsculas/minúsculas) e filtro por continente.
2. **Detalhes do País**: Exibição da capital, área, indicadores socioeconômicos e cálculo de **densidade demográfica** ($\text{habitantes} / \text{km}^2$).
3. **Gerenciamento Local (CRUD)**: Inserção, edição de status/observação e remoção de países de interesse na tabela `travel_list`.

---

## 🔗 API Externa Utilizada
- **Fonte**: IBGE — API de Países (`https://servicodados.ibge.gov.br/api/v1/paises`)
- Consumida exclusivamente pelo backend em `app/api/`.

---

## 📡 Endpoints do Backend

| Método | Rota | Finalidade | Status Esperados |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/countries` | Lista países com filtro por `name` e `continent` | `200`, `500`, `502` |
| `GET` | `/api/countries/[code]` | Retorna detalhes do país, 3+ indicadores e densidade demográfica | `200`, `400`, `404`, `502`, `500` |
| `GET` | `/api/travel-list` | Lista os registros salvos no banco SQLite local | `200`, `500` |
| `POST` | `/api/travel-list` | Cadastra um país na lista local (impede duplicados) | `201`, `400`, `409`, `500` |
| `PATCH` | `/api/travel-list/[id]` | Atualiza campos editáveis (`status` e `note`) | `200`, `400`, `404`, `500` |
| `DELETE` | `/api/travel-list/[id]` | Remove um registro da lista | `204`, `400`, `404`, `500` |

---

## 💾 Banco de Dados SQLite

- **Localização**: `data/app.db` (adicionado ao `.gitignore`)
- **Tabela**: `travel_list`
```sql
CREATE TABLE IF NOT EXISTS travel_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  country_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT CHECK(status IN ('want_to_visit', 'visited')) NOT NULL DEFAULT 'want_to_visit',
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

- **Registros Iniciais (Seeds)**: Inserção automática de 5 registros de exemplo no momento de criação do banco (`lib/db.ts`).

---

## 🛠️ Como Executar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar em modo desenvolvimento
npm run dev

# 3. Abrir no navegador
# http://localhost:3000
```

---

## 📁 Estrutura do Projeto

```
atlas-paises/
├── app/
│   ├── layout.tsx                # Layout global e barra de navegação acessível
│   ├── page.tsx                  # Página 1: Catalogação e filtros de países
│   ├── countries/
│   │   └── [code]/
│   │       └── page.tsx          # Página 2: Detalhe do país, indicadores e formulário
│   └── travel-list/
│       └── page.tsx              # Página 3: Gerenciamento CRUD dos países salvos
├── types/
│   └── index.ts                  # Interfaces TypeScript estritas
└── README.md                     # Documentação completa pré-formatada
```
