# Web Absensi IBBI

Sistem manajemen absensi mahasiswa berbasis web untuk Institut Bisnis dan Informatika Indonesia (IBBI). Aplikasi ini dibangun menggunakan Node.js dengan pola arsitektur MVC (Model-View-Controller).

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Struktur Proyek](#-struktur-proyek)
- [Cara Kerja Kode](#-cara-kerja-kode)
- [Database Schema](#-database-schema)
- [Penggunaan](#-penggunaan)
- [Konvensi Kode](#-konvensi-kode)

## ✨ Fitur

### Fitur yang Sudah Diimplementasikan

- ✅ **Manajemen Admin** - CRUD untuk pengguna admin
- ✅ **Manajemen Dosen** - CRUD untuk data dosen dengan NIDN
- ✅ **Manajemen Mahasiswa** - CRUD untuk data mahasiswa dengan NIM
- ✅ **Manajemen Mata Kuliah** - CRUD untuk data mata kuliah dan SKS
- ✅ **Sistem Role-Based** - Tiga role: admin, dosen, mahasiswa
- ✅ **Password Hashing** - Menggunakan bcrypt untuk keamanan password
- ✅ **Validasi Form** - Validasi lengkap untuk setiap input

### Fitur yang Belum Diimplementasikan

- ⏳ **Manajemen Kelas** - Pembuatan kelas per mata kuliah
- ⏳ **Peserta Kelas** - Pendaftaran mahasiswa ke kelas
- ⏳ **Sesi Absensi** - Pembuatan sesi absensi per pertemuan
- ⏳ **Pencatatan Absensi** - Pencatatan kehadiran mahasiswa (hadir, izin, sakit, alpha)

## 🛠 Teknologi

- **Backend Framework**: Express.js 5.x
- **Template Engine**: Handlebars (express-handlebars)
- **Database**: SQLite 3 (better-sqlite3)
- **CSS Framework**: Bootstrap 5.3
- **Password Hashing**: bcrypt
- **Development Tool**: nodemon

## 📦 Instalasi

### Prasyarat

- Node.js (versi 14 atau lebih baru)
- npm (Node Package Manager)

### Langkah Instalasi

1. Clone atau download repository ini

2. Install dependencies:

```bash
npm install
```

3. Inisialisasi database:

```bash
npm run db:init
```

4. Jalankan server development:

```bash
npm run dev
```

5. Buka browser dan akses:

```
http://localhost:3000
```

## 📁 Struktur Proyek

```
web-absensi/
├── controllers/           # Controller untuk handle request dan response
│   ├── AdminController.js
│   ├── DosenController.js
│   ├── MahasiswaController.js
│   └── MataKuliahController.js
├── database/             # Konfigurasi dan inisialisasi database
│   ├── config.js         # Koneksi SQLite
│   └── init.js           # Script pembuatan tabel
├── models/               # Model untuk query database
│   ├── Admin.js
│   ├── Dosen.js
│   ├── Mahasiswa.js
│   └── MataKuliah.js
├── routes/               # Definisi routing
│   ├── adminRoutes.js
│   ├── dosenRoutes.js
│   ├── mahasiswaRoutes.js
│   └── matakuliahRoutes.js
├── views/                # Template Handlebars
│   ├── layouts/
│   │   └── main.hbs      # Layout utama
│   └── pages/
│       ├── index.hbs     # Halaman home
│       ├── admin/        # Halaman admin
│       ├── dosen/        # Halaman dosen
│       ├── mahasiswa/    # Halaman mahasiswa
│       └── mata-kuliah/  # Halaman mata kuliah
├── diagram.dbml          # Diagram database
├── index.js              # Entry point aplikasi
└── package.json          # Dependencies dan scripts
```

## ⚙️ Cara Kerja Kode

Aplikasi ini menggunakan pola arsitektur **MVC (Model-View-Controller)** dengan alur kerja sebagai berikut:

### 1. Request Flow

```
Browser → Routes → Controller → Model → Database
                      ↓
                    View (Handlebars) → Browser
```

### 2. Komponen Utama

#### A. **Entry Point (index.js)**

File `index.js` adalah titik masuk aplikasi yang mengatur:

```javascript
// 1. Inisialisasi Express
const app = express();

// 2. Middleware untuk parsing form data
app.use(express.urlencoded({ extended: true }));

// 3. Konfigurasi Handlebars dengan custom helpers
app.engine('hbs', engine({
  helpers: {
    inc: (value) => parseInt(value) + 1,  // Untuk nomor urut
    eq: (a, b) => a === b                  // Untuk kondisi
  }
}));

// 4. Static files (Bootstrap dari node_modules)
app.use('/bootstrap', express.static(...));

// 5. Registrasi routes
app.use("/mahasiswa", mahasiswaRoutes);
app.use("/dosen", dosenRoutes);
// ...dst

// 6. Start server di port 3000
app.listen(3000);
```

#### B. **Database Layer (database/)**

**config.js** - Membuat koneksi SQLite yang shared:

```javascript
const Database = require("better-sqlite3");
const db = new Database("absensi-ibbi.db");
module.exports = db;
```

**init.js** - Script untuk membuat tabel dengan foreign key constraints:

```javascript
db.pragma("foreign_keys = ON"); // Aktifkan FK
db.exec(`CREATE TABLE IF NOT EXISTS pengguna ...`);
db.exec(`CREATE TABLE IF NOT EXISTS mahasiswa ...`);
// ... dst
```

#### C. **Model Layer (models/)**

Model bertanggung jawab untuk **semua operasi database**. Menggunakan prepared statements untuk keamanan.

Contoh: `models/Mahasiswa.js`

```javascript
const db = require("../database/config");

// Query SELECT dengan JOIN
function ambilSemuaMahasiswa() {
  return db
    .prepare(
      `
        SELECT pengguna.id, mahasiswa.nim, mahasiswa.program_studi, 
               mahasiswa.angkatan, pengguna.nama, pengguna.email 
        FROM mahasiswa
        JOIN pengguna ON mahasiswa.pengguna_id = pengguna.id
    `,
    )
    .all(); // .all() untuk multiple rows
}

// INSERT dengan foreign key relationship
function buatMahasiswa(nim, nama, email, program_studi, angkatan) {
  // 1. Insert ke tabel pengguna dulu
  const stmt = db.prepare(`
        INSERT INTO pengguna (nama, email, password, peran) 
        VALUES (?, ?, ?, ?)
    `);
  const result = stmt.run(
    nama,
    email,
    bcrypt.hashSync(nim, 10), // Hash NIM sebagai password default
    "mahasiswa",
  );

  // 2. Ambil ID yang baru dibuat
  const penggunaId = result.lastInsertRowid;

  // 3. Insert ke tabel mahasiswa dengan FK ke pengguna
  const mahasiswaStmt = db.prepare(`
        INSERT INTO mahasiswa (pengguna_id, nim, program_studi, angkatan) 
        VALUES (?, ?, ?, ?)
    `);
  mahasiswaStmt.run(penggunaId, nim, program_studi, angkatan);
}
```

**Pola Query**:

- `.all()` → untuk SELECT multiple rows
- `.get()` → untuk SELECT single row
- `.run()` → untuk INSERT/UPDATE/DELETE, return `{ lastInsertRowid, changes }`

#### D. **Controller Layer (controllers/)**

Controller menangani **validasi**, **business logic**, dan **rendering view**.

Contoh: `controllers/MahasiswaController.js`

```javascript
// 1. Fungsi Validasi
function validateMahasiswa(nim, nama, email, program_studi, angkatan) {
  const pesanError = [];

  // Validasi NIM (8-15 digit angka)
  if (!nim || nim.trim() === "") {
    pesanError.push("NIM mahasiswa tidak boleh kosong");
  } else if (!/^\d{8,15}$/.test(nim.trim())) {
    pesanError.push("NIM harus 8-15 digit angka");
  }

  // Validasi nama (min 3 karakter, hanya huruf dan spasi)
  if (!nama || nama.trim() === "") {
    pesanError.push("Nama tidak boleh kosong");
  } else if (nama.trim().length < 3) {
    pesanError.push("Nama minimal 3 karakter");
  } else if (!/^[a-zA-Z\s]+$/.test(nama.trim())) {
    pesanError.push("Nama hanya boleh huruf dan spasi");
  }

  // ... validasi lainnya

  return pesanError; // Array of error messages
}

// 2. Handler untuk CREATE
function createMahasiswa(req, res) {
  const { nim, nama, email, program_studi, angkatan } = req.body;

  // Validasi input
  const pesanError = validateMahasiswa(
    nim,
    nama,
    email,
    program_studi,
    angkatan,
  );

  // Jika ada error, render ulang form dengan error messages
  if (pesanError.length > 0) {
    res.render("pages/mahasiswa/create", {
      pesanError,
      formData: { nim, nama, email, program_studi, angkatan },
    });
    return;
  }

  // Jika valid, simpan ke database via model
  MahasiswaModel.buatMahasiswa(nim, nama, email, program_studi, angkatan);

  // Redirect ke list page
  res.redirect("/mahasiswa/list");
}
```

**Pola Controller**:

- `showCreateForm` → Render form kosong
- `createEntity` → Validasi & insert data
- `listEntity` → Ambil data & render list
- `showEditForm` → Render form dengan data existing
- `editEntity` → Validasi & update data
- `deleteEntity` → Hapus data

#### E. **Route Layer (routes/)**

Routes memetakan URL ke controller functions.

Contoh: `routes/mahasiswaRoutes.js`

```javascript
const router = require("express").Router();
const MahasiswaController = require("../controllers/MahasiswaController");

// GET /mahasiswa/create → Form create
router.get("/create", MahasiswaController.showCreateForm);

// POST /mahasiswa/create → Submit form create
router.post("/create", MahasiswaController.createMahasiswa);

// GET /mahasiswa/list → Daftar mahasiswa
router.get("/list", MahasiswaController.listMahasiswa);

// GET /mahasiswa/edit/:id → Form edit
router.get("/edit/:id", MahasiswaController.showEditForm);

// POST /mahasiswa/edit/:id → Submit form edit
router.post("/edit/:id", MahasiswaController.editMahasiswa);

// POST /mahasiswa/delete/:id → Delete mahasiswa
router.post("/delete/:id", MahasiswaController.deleteMahasiswa);

module.exports = router;
```

#### F. **View Layer (views/)**

Menggunakan **Handlebars** sebagai template engine.

**Layout**: `views/layouts/main.hbs`

```handlebars
<html>
  <head>
    <title>Web Absensi</title>
    <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
  </head>
  <body>
    <nav class="navbar">
      <!-- Navigation menu -->
    </nav>

    <div class="container">
      {{{body}}}
      <!-- Content dari page akan dimasukkan di sini -->
    </div>

    <script src="/bootstrap/js/bootstrap.bundle.min.js"></script>
  </body>
</html>
```

**Page**: `views/pages/mahasiswa/create.hbs`

```handlebars
<h1>Create Mahasiswa</h1>

<!-- Display validation errors -->
{{#if pesanError}}
  <div class="alert alert-danger">
    <ul>
      {{#each pesanError}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
{{/if}}

<!-- Form dengan Bootstrap classes -->
<form action="/mahasiswa/create" method="POST">
  <div class="mb-3">
    <label for="nim">NIM</label>
    <input type="text" name="nim" class="form-control" />
  </div>
  <!-- ... field lainnya -->
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### 3. Alur Lengkap Contoh: Create Mahasiswa

```
1. User mengakses GET /mahasiswa/create
   ↓
2. Route menjalankan MahasiswaController.showCreateForm()
   ↓
3. Controller render view 'pages/mahasiswa/create'
   ↓
4. User mengisi form dan submit (POST /mahasiswa/create)
   ↓
5. Route menjalankan MahasiswaController.createMahasiswa()
   ↓
6. Controller validasi input:
   - Jika ada error → render ulang form dengan pesanError
   - Jika valid → lanjut step 7
   ↓
7. Controller panggil MahasiswaModel.buatMahasiswa()
   ↓
8. Model:
   a. INSERT ke tabel 'pengguna' (dapat penggunaId)
   b. INSERT ke tabel 'mahasiswa' dengan FK penggunaId
   ↓
9. Controller redirect ke /mahasiswa/list
   ↓
10. User melihat daftar mahasiswa (data baru sudah ada)
```

## 🗄️ Database Schema

Database menggunakan **SQLite** dengan struktur sebagai berikut:

### Tabel Utama

**pengguna** - Tabel user dengan role-based system

```sql
- id (PK, AUTO_INCREMENT)
- nama (TEXT)
- email (TEXT, UNIQUE)
- password (TEXT, hashed dengan bcrypt)
- peran (TEXT: 'admin' | 'dosen' | 'mahasiswa')
- dibuat_pada (DATETIME)
- diperbarui_pada (DATETIME)
```

**mahasiswa** - Data mahasiswa

```sql
- id (PK)
- pengguna_id (FK → pengguna.id)
- nim (TEXT, UNIQUE, 8-15 digit)
- program_studi (TEXT: 'ti' | 'si' | 'it')
- angkatan (INTEGER, 2000-2100)
```

**dosen** - Data dosen

```sql
- id (PK)
- pengguna_id (FK → pengguna.id)
- nidn (TEXT, UNIQUE)
- departemen (TEXT)
```

**mata_kuliah** - Data mata kuliah

```sql
- id (PK)
- kode (TEXT, UNIQUE)
- nama (TEXT)
- sks (INTEGER)
```

### Tabel untuk Fitur yang Belum Diimplementasikan

- **kelas** - Kelas per mata kuliah dan dosen
- **peserta_kelas** - Many-to-many mahasiswa dan kelas
- **sesi_absensi** - Sesi pertemuan per kelas
- **absensi** - Record kehadiran mahasiswa

Lihat [diagram.dbml](diagram.dbml) untuk schema lengkap dan relasi antar tabel.

## 📖 Penggunaan

### Menjalankan Aplikasi

```bash
# Development mode (auto-reload)
npm run dev

# Inisialisasi ulang database (HATI-HATI: menghapus data!)
npm run db:init
```

### Navigasi Menu

- **Home** (`/`) - Halaman utama
- **Mata Kuliah** (`/mata-kuliah/list`) - Manajemen mata kuliah
- **Dosen** (`/dosen/list`) - Manajemen dosen
- **Mahasiswa** (`/mahasiswa/list`) - Manajemen mahasiswa
- **Admin** (`/admin/list`) - Manajemen admin

### Default Password

Sistem membuat password default berdasarkan role:

- **Mahasiswa**: Password = NIM mereka
- **Dosen**: Password = NIDN mereka
- **Admin**: Password yang diinput saat pembuatan

Semua password di-hash menggunakan bcrypt sebelum disimpan.

## 📝 Konvensi Kode

### Bahasa: Indonesia

Seluruh kode menggunakan **bahasa Indonesia** untuk penamaan:

**Function naming**:

- `ambil*` - untuk fetch/get data (contoh: `ambilSemuaMahasiswa`)
- `buat*` - untuk create data (contoh: `buatMahasiswa`)
- `update*` - untuk update data
- `hapus*` - untuk delete data

**Variable naming**:

- `pesanError` - error messages
- `penggunaId` - user ID
- `mataKuliah` - course

**Database columns**:

- `pengguna_id` - user ID
- `dibuat_pada` - created at
- `diperbarui_pada` - updated at
- `nama_kelas` - class name

### Naming Conventions

- **JavaScript**: camelCase (`penggunaId`, `showCreateForm`)
- **Database**: snake_case (`pengguna_id`, `mata_kuliah`)
- **Routes**: kebab-case (`/mata-kuliah/create`)

### Aturan Validasi

**NIM (Nomor Induk Mahasiswa)**:

- Wajib diisi
- 8-15 digit angka
- Regex: `/^\d{8,15}$/`

**NIDN (Nomor Induk Dosen Nasional)**:

- Format khusus sesuai ketentuan
- Unik untuk setiap dosen

**Nama**:

- Minimal 3 karakter
- Hanya huruf dan spasi
- Regex: `/^[a-zA-Z\s]+$/`

**Email**:

- Format email valid
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Program Studi**:

- Pilihan: 'ti', 'si', atau 'it'

**Angkatan**:

- Antara 2000 - 2100

## 🔐 Security

- **Password Hashing**: Menggunakan bcrypt dengan salt rounds
- **Foreign Key Constraints**: ON DELETE CASCADE untuk data integrity
- **Prepared Statements**: Mencegah SQL injection
- **Input Validation**: Validasi di controller sebelum ke database

## 🚀 Pengembangan Selanjutnya

Untuk menambah modul baru (contoh: Kelas):

1. Buat `models/Kelas.js` dengan fungsi ambil*, buat*, update*, hapus*
2. Buat `controllers/KelasController.js` dengan validate\* dan CRUD handlers
3. Buat `routes/kelasRoutes.js` dengan standard CRUD routes
4. Buat views di `views/pages/kelas/` (create.hbs, list.hbs, edit.hbs)
5. Register route di `index.js`: `app.use("/kelas", kelasRoutes)`

## 📄 Lisensi

ISC

## 👥 Kontributor

Institut Bisnis dan Informatika Indonesia (IBBI)

---

Untuk detail teknis lebih lanjut, lihat [AGENTS.md](AGENTS.md).
