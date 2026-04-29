# Agent Instructions: Web Absensi IBBI

An attendance management system (sistem absensi mahasiswa) for IBBI using Express.js, Handlebars, and SQLite.

## Quick Start

```bash
npm install
npm run db:init    # Initialize SQLite database
npm run dev        # Start development server (nodemon on port 3000)
```

## Architecture

**Stack**: Node.js + Express 5 + Handlebars + better-sqlite3 + Bootstrap 5

**MVC Structure**:

- `models/` - Database query functions (direct SQL with better-sqlite3)
- `controllers/` - Request handlers, validation, view rendering
- `views/` - Handlebars templates (.hbs) with layouts
- `routes/` - Express routers mapping HTTP methods to controllers

**Database**: SQLite (`absensi-ibbi.db`) with role-based user system:

- `pengguna` - Base user table with role: admin, dosen (lecturer), mahasiswa (student)
- Entity tables: `mahasiswa`, `dosen`, `mata_kuliah` (courses), `kelas`, `absensi`
- See [diagram.dbml](diagram.dbml) for complete schema

## Code Conventions

### Language: Indonesian

All code, variables, functions, database columns, comments, and UI text use **Indonesian**:

- `ambil*` - fetch/get (e.g., `ambilSemuaMahasiswa`)
- `buat*` - create (e.g., `buatMahasiswa`)
- `update*` - update
- `hapus*` - delete
- `pesan` - message, `pesanError` - error messages
- Database columns: `pengguna_id`, `dibuat_pada`, `diperbarui_pada`, `nama_kelas`

### Naming Styles

- **JavaScript**: camelCase for variables/functions (`penggunaId`, `showCreateForm`)
- **Database**: snake_case for tables/columns (`pengguna_id`, `mata_kuliah`)
- **Routes**: kebab-case URLs (`/mata-kuliah/create`)

### Model Pattern

Models export functions that execute SQL directly using better-sqlite3 prepared statements:

```javascript
const db = require('../database/config');

function ambilSemuaMahasiswa() {
    return db.prepare(`SELECT ... FROM mahasiswa ...`).all();
}

function buatMahasiswa(nim, nama, email, program_studi, angkatan) {
    const stmt = db.prepare(`INSERT INTO pengguna ...`);
    const result = stmt.run(nama, email, ...);
    const penggunaId = result.lastInsertRowid; // Get auto-increment ID
    // ...
}

module.exports = { ambilSemuaMahasiswa, buatMahasiswa, ... };
```

**Key patterns**:

- Use `.all()` for multiple rows, `.get()` for single row, `.run()` for INSERT/UPDATE/DELETE
- Access `result.lastInsertRowid` for auto-increment IDs
- Handle FK relationships (e.g., create `pengguna` first, then entity table)

### Controller Pattern

Controllers handle validation, call models, and render Handlebars views:

```javascript
const MahasiswaModel = require('../models/Mahasiswa');

function validateMahasiswa(nim, nama, email, program_studi, angkatan) {
    const pesanError = [];

    if (!nim || nim.trim() === '') {
        pesanError.push("NIM mahasiswa tidak boleh kosong");
    }
    // Validate each field...

    return pesanError; // Return array of error messages
}

function createMahasiswa(req, res) {
    const { nim, nama, email, ... } = req.body;

    const pesanError = validateMahasiswa(nim, nama, ...);

    if (pesanError.length > 0) {
        res.render('pages/mahasiswa/create', {
            pesanError,
            formData: { nim, nama, ... } // Preserve form data
        });
        return;
    }

    MahasiswaModel.buatMahasiswa(nim, nama, ...);
    res.redirect('/mahasiswa/list');
}
```

**Validation rules** (inline in controllers):

- NIM: 8-15 digits
- NIDN (dosen): specific format
- Name: min 3 chars, letters and spaces only
- Email: valid format
- Angkatan (year): 2000-2100
- Program studi: ti, si, or it

### Route Pattern

Standard CRUD routes for each entity:

```javascript
router.get("/create", Controller.showCreateForm);
router.post("/create", Controller.createEntity);
router.get("/list", Controller.listEntity);
router.get("/edit/:id", Controller.showEditForm);
router.post("/edit/:id", Controller.editEntity);
router.post("/delete/:id", Controller.deleteEntity);
```

### View Pattern

Handlebars templates with `main.hbs` layout. Bootstrap 5 loaded from node_modules:

```handlebars
{{#if pesanError}}
  {{#each pesanError}}
    <div class="alert alert-danger">{{this}}</div>
  {{/each}}
{{/if}}
```

**Custom helpers** (defined in index.js):

- `inc` - increment value for display (0-indexed to 1-indexed)
- `eq` - equality check for conditionals

## Security & Data Rules

- **Passwords**: bcrypt hashed, default password = NIM for mahasiswa, NIDN for dosen
- **Foreign keys**: CASCADE on DELETE (enabled in database/init.js)
- **Role-based**: `peran` field in `pengguna` table controls access (admin, dosen, mahasiswa)

## Key Files

- [index.js](index.js) - App entry, middleware, routes, Handlebars config
- [database/config.js](database/config.js) - Shared SQLite connection
- [database/init.js](database/init.js) - Schema creation script
- [diagram.dbml](diagram.dbml) - Complete database schema reference

## Common Tasks

**Add a new entity**:

1. Create model with ambil*, buat*, update*, hapus* functions
2. Create controller with validate*, show*Form, create*, edit*, delete\* functions
3. Create route with standard CRUD endpoints
4. Create views: create.hbs, list.hbs, edit.hbs in pages/[entity-name]/
5. Register route in index.js

**Update validation**: Modify validate\* function in controller, add rules to pesanError array

**Query with JOIN**: Models often join `pengguna` table for shared fields (nama, email)

## Current Implementation Status

Implemented modules: Admin, Dosen, Mahasiswa, MataKuliah

Not yet implemented: Kelas (classes), PesertaKelas, SesiAbsensi, Absensi (core attendance features)
