const KelasModel = require('../models/Kelas');
const MataKuliahModel = require('../models/MataKuliah');
const DosenModel = require('../models/Dosen');
const MahasiswaModel = require('../models/Mahasiswa');
const PesertaKelasModel = require('../models/PesertaKelas');

const PROGRAM_STUDI_MAP = {
    'ti': { value: 'ti', label: 'Teknik Informatika (TI)' },
    'it': { value: 'it', label: 'Teknologi Informasi (IT)' },
    'si': { value: 'si', label: 'Sistem Informasi (SI)' }
};

function mapProgramStudiList(programStudiCodes) {
    return programStudiCodes.map(code => PROGRAM_STUDI_MAP[code] || { value: code, label: code }).sort((a, b) => a.label.localeCompare(b.label));
}

function validateKelas(mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik, kelas_id_untuk_edit = null) {
    const pesanError = [];

    // Validate mata_kuliah_id
    if (!mata_kuliah_id || mata_kuliah_id.trim() === '') {
        pesanError.push("Mata kuliah harus dipilih");
    } else if (isNaN(parseInt(mata_kuliah_id))) {
        pesanError.push("Mata kuliah tidak valid");
    }

    // Validate dosen_id
    if (!dosen_id || dosen_id.trim() === '') {
        pesanError.push("Dosen harus dipilih");
    } else if (isNaN(parseInt(dosen_id))) {
        pesanError.push("Dosen tidak valid");
    }

    // Validate nama_kelas
    if (!nama_kelas || nama_kelas.trim() === '') {
        pesanError.push("Nama kelas tidak boleh kosong");
    } else if (nama_kelas.trim().length < 2) {
        pesanError.push("Nama kelas harus terdiri dari minimal 2 karakter");
    } else if (nama_kelas.trim().length > 50) {
        pesanError.push("Nama kelas tidak boleh lebih dari 50 karakter");
    } else if (!/^[a-zA-Z0-9\s\-]+$/.test(nama_kelas.trim())) {
        pesanError.push("Nama kelas hanya boleh mengandung huruf, angka, spasi, dan tanda hubung");
    }

    // Validate semester
    if (!semester || semester.trim() === '') {
        pesanError.push("Semester harus dipilih");
    } else if (!['Gasal', 'Genap'].includes(semester.trim())) {
        pesanError.push("Semester harus Gasal atau Genap");
    }

    // Validate tahun_akademik
    if (!tahun_akademik || tahun_akademik.trim() === '') {
        pesanError.push("Tahun akademik tidak boleh kosong");
    } else if (!/^\d{4}\/\d{4}$/.test(tahun_akademik.trim())) {
        pesanError.push("Format tahun akademik harus YYYY/YYYY (misal: 2024/2025)");
    } else {
        const years = tahun_akademik.trim().split('/');
        const year1 = parseInt(years[0]);
        const year2 = parseInt(years[1]);
        if (year2 !== year1 + 1) {
            pesanError.push("Tahun akademik tidak valid (tahun kedua harus tahun pertama + 1)");
        }
        if (year1 < 2000 || year1 > 2100) {
            pesanError.push("Tahun akademik tidak valid (harus antara 2000 dan 2100)");
        }
    }

    // Check uniqueness of (mata_kuliah_id, semester, tahun_akademik)
    if (!pesanError.length && mata_kuliah_id && semester && tahun_akademik) {
        const existingKelas = KelasModel.ambilSemuaKelas().find(k => 
            k.mata_kuliah_id === parseInt(mata_kuliah_id) &&
            k.semester === semester.trim() &&
            k.tahun_akademik === tahun_akademik.trim() &&
            (!kelas_id_untuk_edit || k.id !== parseInt(kelas_id_untuk_edit))
        );
        
        if (existingKelas) {
            pesanError.push("Kombinasi mata kuliah, semester, dan tahun akademik sudah ada");
        }
    }

    return pesanError;
}

function showCreateForm(req, res) {
    const mataKuliah = MataKuliahModel.ambilSemuaMataKuliah();
    const dosen = DosenModel.ambilSemuaDosen();
    
    // Get mahasiswa with correct ID for peserta_kelas FK relationship
    const db = require('../database/config');
    const mahasiswa = db.prepare(`
        SELECT mahasiswa.id, mahasiswa.nim, mahasiswa.program_studi, 
        mahasiswa.angkatan, pengguna.nama, pengguna.email 
        FROM mahasiswa
        JOIN pengguna ON mahasiswa.pengguna_id = pengguna.id
        ORDER BY pengguna.nama ASC
    `).all();
    
    // Extract unique angkatan and program_studi for filter dropdowns
    const angkatanSet = new Set(mahasiswa.map(m => m.angkatan));
    const programStudiSet = new Set(mahasiswa.map(m => m.program_studi));
    const angkatanList = Array.from(angkatanSet).sort((a, b) => b - a);
    const programStudiList = mapProgramStudiList(Array.from(programStudiSet));
    
    res.render('pages/kelas/create', { 
        mataKuliah, 
        dosen, 
        mahasiswa, 
        angkatanList, 
        programStudiList,
        formData: {}
    });
}

function createKelas(req, res) {
    const { mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik, peserta_mahasiswa } = req.body;

    const pesanError = validateKelas(mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik);

    if (pesanError.length > 0) {
        const mataKuliah = MataKuliahModel.ambilSemuaMataKuliah();
        const dosen = DosenModel.ambilSemuaDosen();
        
        // Get mahasiswa with correct ID for peserta_kelas FK relationship
        const db = require('../database/config');
        const mahasiswa = db.prepare(`
            SELECT mahasiswa.id, mahasiswa.nim, mahasiswa.program_studi, 
            mahasiswa.angkatan, pengguna.nama, pengguna.email 
            FROM mahasiswa
            JOIN pengguna ON mahasiswa.pengguna_id = pengguna.id
            ORDER BY pengguna.nama ASC
        `).all();
        
        // Extract unique angkatan and program_studi for filter dropdowns
        const angkatanSet = new Set(mahasiswa.map(m => m.angkatan));
        const programStudiSet = new Set(mahasiswa.map(m => m.program_studi));
        const angkatanList = Array.from(angkatanSet).sort((a, b) => b - a);
        const programStudiList = mapProgramStudiList(Array.from(programStudiSet));
        
        res.render('pages/kelas/create', {
            pesanError,
            formData: { mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik },
            mataKuliah,
            dosen,
            mahasiswa,
            peserta_mahasiswa_selected: peserta_mahasiswa,
            angkatanList,
            programStudiList
        });
        return;
    }

    // Create kelas
    const result = KelasModel.buatKelas(mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik);
    const kelas_id = result.lastInsertRowid;

    // Set peserta kelas (bulk assign students)
    const mahasiswa_ids = Array.isArray(peserta_mahasiswa) ? peserta_mahasiswa.map(id => parseInt(id)) : [];
    PesertaKelasModel.setBulkPesertaKelas(kelas_id, mahasiswa_ids);

    res.redirect('/kelas/list');
}

function listKelas(req, res) {
    const kelas = KelasModel.ambilSemuaKelas();
    res.render('pages/kelas/list', { kelas });
}

function showEditForm(req, res) {
    const { id } = req.params;
    const kelas = KelasModel.ambilKelasById(id);

    if (!kelas) {
        return res.status(404).send('Kelas tidak ditemukan');
    }

    const mataKuliah = MataKuliahModel.ambilSemuaMataKuliah();
    const dosen = DosenModel.ambilSemuaDosen();
    
    // Get mahasiswa with correct ID for peserta_kelas FK relationship
    const db = require('../database/config');
    const mahasiswa = db.prepare(`
        SELECT mahasiswa.id, mahasiswa.nim, mahasiswa.program_studi, 
        mahasiswa.angkatan, pengguna.nama, pengguna.email 
        FROM mahasiswa
        JOIN pengguna ON mahasiswa.pengguna_id = pengguna.id
        ORDER BY pengguna.nama ASC
    `).all();
    
    const peserta = PesertaKelasModel.ambilMahasiswaByKelasId(id);

    // Create array of enrolled student IDs for pre-checking checkboxes
    const peserta_ids = peserta.map(p => p.mahasiswa_id);

    // Extract unique angkatan and program_studi for filter dropdowns
    const angkatanSet = new Set(mahasiswa.map(m => m.angkatan));
    const programStudiSet = new Set(mahasiswa.map(m => m.program_studi));
    const angkatanList = Array.from(angkatanSet).sort((a, b) => b - a);
    const programStudiList = mapProgramStudiList(Array.from(programStudiSet));

    res.render('pages/kelas/edit', {
        kelas,
        mataKuliah,
        dosen,
        mahasiswa,
        peserta_ids,
        angkatanList,
        programStudiList
    });
}

function editKelas(req, res) {
    const { id } = req.params;
    const { mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik, peserta_mahasiswa } = req.body;

    const kelas = KelasModel.ambilKelasById(id);
    if (!kelas) {
        return res.status(404).send('Kelas tidak ditemukan');
    }

    const pesanError = validateKelas(mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik, id);

    if (pesanError.length > 0) {
        const mataKuliah = MataKuliahModel.ambilSemuaMataKuliah();
        const dosen = DosenModel.ambilSemuaDosen();
        
        // Get mahasiswa with correct ID for peserta_kelas FK relationship
        const db = require('../database/config');
        const mahasiswa = db.prepare(`
            SELECT mahasiswa.id, mahasiswa.nim, mahasiswa.program_studi, 
            mahasiswa.angkatan, pengguna.nama, pengguna.email 
            FROM mahasiswa
            JOIN pengguna ON mahasiswa.pengguna_id = pengguna.id
            ORDER BY pengguna.nama ASC
        `).all();
        
        // Extract unique angkatan and program_studi for filter dropdowns
        const angkatanSet = new Set(mahasiswa.map(m => m.angkatan));
        const programStudiSet = new Set(mahasiswa.map(m => m.program_studi));
        const angkatanList = Array.from(angkatanSet).sort((a, b) => b - a);
        const programStudiList = Array.from(programStudiSet).sort();
        
        res.render('pages/kelas/edit', {
            pesanError,
            kelas: { id, mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik },
            formData: { mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik },
            mataKuliah,
            dosen,
            mahasiswa,
            peserta_ids: peserta_mahasiswa,
            angkatanList,
            programStudiList
        });
        return;
    }

    // Update kelas
    KelasModel.updateKelas(id, mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik);

    // Update peserta kelas (bulk upsert)
    const mahasiswa_ids = Array.isArray(peserta_mahasiswa) ? peserta_mahasiswa.map(id => parseInt(id)) : [];
    PesertaKelasModel.setBulkPesertaKelas(id, mahasiswa_ids);

    res.redirect('/kelas/list');
}

function deleteKelas(req, res) {
    const { id } = req.params;
    KelasModel.hapusKelas(id);
    res.redirect('/kelas/list');
}

module.exports = {
    showCreateForm,
    createKelas,
    listKelas,
    showEditForm,
    editKelas,
    deleteKelas
};
