const db = require('../database/config');

function ambilMahasiswaByKelasId(kelas_id) {
    return db.prepare(`
        SELECT 
            peserta_kelas.id,
            mahasiswa.id as mahasiswa_id,
            mahasiswa.nim,
            pengguna.nama,
            pengguna.email,
            mahasiswa.program_studi,
            mahasiswa.angkatan
        FROM peserta_kelas
        JOIN mahasiswa ON peserta_kelas.mahasiswa_id = mahasiswa.id
        JOIN pengguna ON mahasiswa.pengguna_id = pengguna.id
        WHERE peserta_kelas.kelas_id = ?
        ORDER BY pengguna.nama ASC
    `).all(kelas_id);
}

function buatPesertaKelas(mahasiswa_id, kelas_id) {
    const stmt = db.prepare(`
        INSERT INTO peserta_kelas (mahasiswa_id, kelas_id)
        VALUES (?, ?)
    `);
    return stmt.run(mahasiswa_id, kelas_id);
}

function hapusPesertaKelas(id) {
    const stmt = db.prepare(`DELETE FROM peserta_kelas WHERE id = ?`);
    return stmt.run(id);
}

function hapusPesertaKelasByKelasId(kelas_id) {
    const stmt = db.prepare(`DELETE FROM peserta_kelas WHERE kelas_id = ?`);
    return stmt.run(kelas_id);
}

function setBulkPesertaKelas(kelas_id, mahasiswa_ids_array) {
    // Delete all existing enrollments for this class
    hapusPesertaKelasByKelasId(kelas_id);
    
    // Insert new enrollments if array is not empty
    if (mahasiswa_ids_array && mahasiswa_ids_array.length > 0) {
        const stmt = db.prepare(`INSERT INTO peserta_kelas (mahasiswa_id, kelas_id) VALUES (?, ?)`);
        mahasiswa_ids_array.forEach(mahasiswa_id => {
            stmt.run(mahasiswa_id, kelas_id);
        });
    }
}

module.exports = {
    ambilMahasiswaByKelasId,
    buatPesertaKelas,
    hapusPesertaKelas,
    hapusPesertaKelasByKelasId,
    setBulkPesertaKelas
};
