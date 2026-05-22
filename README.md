# Mahiane & Mateus — Wedding RSVP Site

Site de confirmação de presença para o casamento de **Mahiane & Mateus**, hospedado no **GitHub Pages** com banco de dados **Supabase**.

---

## 🚀 Setup Inicial

### 1. Supabase — Criar a tabela

Execute o SQL abaixo no **SQL Editor** do seu projeto Supabase:

```sql
-- Tabela de confirmações
CREATE TABLE confirmations (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name       text NOT NULL,
  additional_guests text[] DEFAULT '{}',
  total_guests     integer NOT NULL DEFAULT 1,
  confirmed_at     timestamptz NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE confirmations ENABLE ROW LEVEL SECURITY;

-- Permitir apenas INSERT público (sem autenticação)
CREATE POLICY "allow_public_insert" ON confirmations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Bloquear SELECT/UPDATE/DELETE públicos (apenas via painel do Supabase)
```

### 2. GitHub Secrets — Configurar as chaves

Vá em **Settings → Secrets and variables → Actions** no seu repositório e crie:

| Secret | Valor |
|---|---|
| `SUPABASE_URL` | URL do seu projeto (ex: `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Chave `anon` / `public` do seu projeto |

### 3. GitHub Pages — Habilitar

Vá em **Settings → Pages** e configure:
- **Source**: GitHub Actions

### 4. Subir o código

```bash
git init
git add .
git commit -m "feat: wedding RSVP site"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

O GitHub Actions vai automaticamente:
1. Injetar as chaves no `js/main.js`
2. Fazer o deploy no GitHub Pages

---

## 📸 Substituir as fotos do carrossel

Coloque suas 6 fotos em `assets/photos/` com os nomes:
- `photo1.jpg` → `photo6.jpg`

Formatos aceitos: `.jpg`, `.jpeg`, `.png`, `.webp`

> **Dica**: Para melhor performance, redimensione as fotos para ~1200×1600px (formato retrato) antes de subir.

---

## 📊 Ver confirmações

Acesse o **Table Editor** no painel do Supabase para visualizar todas as confirmações recebidas. Você pode exportar como CSV para uma planilha.

---

## 📁 Estrutura do Projeto

```
wedding-rsvp/
├── index.html                  # Landing page
├── css/
│   └── style.css               # Estilos
├── js/
│   └── main.js                 # Lógica (Supabase, carrossel, modal)
├── assets/
│   └── photos/
│       ├── photo1.jpg          # Substitua pelas fotos do casal
│       └── ...photo6.jpg
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Actions (build + deploy)
```
