# URL Shortener

Sebuah project URL Shortener _fullstack_ yang ringan dan cepat. Project ini terdiri dari bagian **Client** (Frontend) dan **Server** (Backend) yang terpisah, namun terintegrasi secara _end-to-end type-safe_ menggunakan Hono RPC. Selain memendekkan URL, project ini juga dilengkapi dengan fitur analitik dan pembuatan QR Code.

## 🚀 Fitur Utama

- **Memendekkan URL:** Mengubah URL panjang menjadi tautan pendek yang rapi dan mudah dibagikan.
- **QR Code Generator:** Otomatis menghasilkan gambar QR Code untuk setiap URL yang dipendekkan.
- **Analitik Pengunjung:** Melacak data pengunjung (seperti tipe perangkat dan browser) ketika tautan pendek diklik menggunakan deteksi User-Agent.
- **End-to-End Type Safety:** Konsistensi tipe data dari database hingga ke UI menggunakan integrasi Zod, Drizzle, dan Hono Client.

## 🛠️ Tech Stack

Project ini mengusung teknologi modern dengan performa tinggi:

### Client (Frontend)

- **Framework:** [Solid.js](https://www.solidjs.com/) (reaktivitas tanpa virtual DOM)
- **Routing:** `@solidjs/router`
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Integrasi API:** Hono Client
- **Utilitas Tambahan:** `qrcode`
- **Bahasa:** TypeScript

### Server (Backend)

- **Runtime:** [Bun](https://bun.sh/)
- **Framework Web:** [Hono](https://hono.dev/)
- **ORM (Database):** Drizzle ORM
- **Database Driver:** PostgreSQL (`postgres`)
- **Validasi Data:** Zod & `@hono/zod-validator`
- **Utilitas Tambahan:** `nanoid` (untuk _generate_ ID pendek), `ua-parser-js` (untuk analitik _user-agent_)
- **Bahasa:** TypeScript

## 📂 Struktur Project

```text
url-shortener/
├── client/                 # Aplikasi frontend (Solid.js + Vite)
│   ├── src/
│   │   ├── components/     # UI Component yang dapat digunakan kembali
│   │   ├── context/        # Solid.js Context API Providers
│   │   ├── lib/            # Konfigurasi eksternal (contoh: Hono RPC client)
│   │   ├── pages/          # File halaman/routing aplikasi
│   │   ├── store/          # State management global
│   │   ├── index.css       # Konfigurasi dan import Tailwind CSS
│   │   └── index.tsx       # Entry point Frontend aplikasi
│   ├── package.json        
│   └── vite.config.ts      
├── server/                 # Aplikasi backend API (Hono + Bun + PostgreSQL)
│   ├── src/
│   │   ├── db/             # Konfigurasi koneksi database & Drizzle schemas
│   │   ├── middlewares/    # Middleware custom (contoh: auth, logger)
│   │   ├── modules/        # Route dan logic API yang dikelompokkan per fitur
│   │   ├── types/          # Definisi Type/Interface global untuk backend
│   │   ├── utils/          # Fungsi utilitas helper (contoh: nanoid generator)
│   │   └── index.ts        # Entry point Backend (Hono app)
│   ├── drizzle/            # File hasil generasi migrasi Drizzle ORM
│   ├── .env                # File Environment local kamu (jangan di-commit)
│   ├── .env.example        # File template Environment (sebagai patokan variabel)
│   └── package.json        
└── README.md               # Dokumentasi utama (file ini)
```

## 💻 Panduan Clone & Instalasi

### Prasyarat

Sebelum memulai, pastikan kamu sudah menginstal perangkat lunak berikut:

- **Git**
- **[Bun](https://bun.sh/)** (Sangat direkomendasikan karena backend sepenuhnya dirancang menggunakan runtime Bun)
- **PostgreSQL** (Bisa di lokal atau menggunakan layanan cloud database seperti Supabase/Neon)

### 1. Clone Repository

Buka terminal dan jalankan:

```bash
git clone https://github.com/ricolutfiansyah/url-shortener.git
cd url-shortener
```

### 2. Setup Server (Backend)

Buka direktori server untuk mengatur database dan menjalankan API:

```bash
cd server

# 1. Install semua dependencies
bun install

# 2. Atur Environment Variables
# Duplikat file .env.example menjadi .env
cp .env.example .env

# Lalu buka file .env dan sesuaikan nilainya (seperti kredensial koneksi database)
# Nilai default di .env.example sudah cukup sebagai panduan:
# DATABASE_URL=postgresql://root:password@localhost:5432/urlshortener
# APP_DOMAIN=localhost:3000
# dll.

# 3. Jalankan migrasi ke database
bun run db:generate
bun run db:migrate

# 4. Jalankan server di mode development
bun run dev
```

Secara default, API server backend akan berjalan dan siap menerima _request_.

### 3. Setup Client (Frontend)

Buka tab terminal baru (jangan matikan server backend) dan arahkan ke direktori client:

```bash
# Pastikan kamu berada di root folder 'url-shortener'
cd client

# 1. Install semua dependencies
bun install

# 2. Jalankan server development
bun run dev
```

Sekarang buka browser kamu dan akses alamat yang tertera di terminal (biasanya `http://localhost:5173`). Aplikasi Frontend dan Backend sudah berjalan dan saling terhubung!
