const db = require('../database/config');

function ambilSemuaKelas() {
    return db.prepare(`
        SELECT 
            kelas.id,
            kelas.mata_kuliah_id,
            kelas.dosen_id,
            kelas.nama_kelas,
            kelas.semester,
            kelas.tahun_akademik,
            mata_kuliah.nama as nama_mata_kuliah,
            mata_kuliah.kode as kode_mata_kuliah,
            pengguna.nama as nama_dosen,
            pengguna.email as email_dosen,
            COUNT(peserta_kelas.id) as jumlah_peserta
        FROM kelas
        JOIN mata_kuliah ON kelas.mata_kuliah_id = mata_kuliah.id
        JOIN dosen ON kelas.dosen_id = dosen.id
        JOIN pengguna ON dosen.pengguna_id = pengguna.id
        LEFT JOIN peserta_kelas ON kelas.id = peserta_kelas.kelas_id
        GROUP BY kelas.id
        ORDER BY kelas.tahun_akademik DESC, kelas.semester DESC, kelas.nama_kelas ASC
    `).all();
}

function ambilKelasById(id) {
    return db.prepare(`
        SELECT 
            kelas.id,
            kelas.mata_kuliah_id,
            kelas.dosen_id,
            kelas.nama_kelas,
            kelas.semester,
            kelas.tahun_akademik,
            mata_kuliah.nama as nama_mata_kuliah,
            mata_kuliah.kode as kode_mata_kuliah,
            pengguna.nama as nama_dosen,
            pengguna.email as email_dosen,
            COUNT(peserta_kelas.id) as jumlah_peserta
        FROM kelas
        JOIN mata_kuliah ON kelas.mata_kuliah_id = mata_kuliah.id
        JOIN dosen ON kelas.dosen_id = dosen.id
        JOIN pengguna ON dosen.pengguna_id = pengguna.id
        LEFT JOIN peserta_kelas ON kelas.id = peserta_kelas.kelas_id
        WHERE kelas.id = ?
        GROUP BY kelas.id
    `).get(id);
}

function buatKelas(mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik) {
    const stmt = db.prepare(`
        INSERT INTO kelas (mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik)
        VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik);
}

function updateKelas(id, mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik) {
    const stmt = db.prepare(`
        UPDATE kelas
        SET mata_kuliah_id = ?, dosen_id = ?, nama_kelas = ?, semester = ?, tahun_akademik = ?
        WHERE id = ?
    `);
    return stmt.run(mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik, id);
}

function hapusKelas(id) {
    const stmt = db.prepare(`DELETE FROM kelas WHERE id = ?`);
    return stmt.run(id);
}

module.exports = {
    ambilSemuaKelas,
    ambilKelasById,
    buatKelas,
    updateKelas,
    hapusKelas
};
