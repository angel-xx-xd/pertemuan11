const db = require('./config');
const bcrypt = require('bcrypt');

db.pragma("foreign_keys = ON");

// Fungsi untuk hash password
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Fungsi untuk seed data
async function seedDatabase() {
    try {
        console.log('🌱 Memulai seeding database...');
        
        // ===== CLEAR EXISTING DATA =====
        console.log('\n🧹 Menghapus data lama...');
        db.prepare('DELETE FROM absensi').run();
        db.prepare('DELETE FROM sesi_absensi').run();
        db.prepare('DELETE FROM peserta_kelas').run();
        db.prepare('DELETE FROM kelas').run();
        db.prepare('DELETE FROM mata_kuliah').run();
        db.prepare('DELETE FROM mahasiswa').run();
        db.prepare('DELETE FROM dosen').run();
        db.prepare('DELETE FROM pengguna').run();

        // ===== SEED PENGGUNA =====
        console.log('📝 Seeding tabel pengguna...');
        const adminPassword = await hashPassword('admin123');
        const dosenPassword = await hashPassword('dosen123');
        const mahasiswaPassword = await hashPassword('mahasiswa123');

        // Admin
        const adminIds = [];
        for (let i = 1; i <= 2; i++) {
            const result = db.prepare(`
                INSERT INTO pengguna (nama, email, password, peran)
                VALUES (?, ?, ?, ?)
            `).run(
                `Admin ${i}`,
                `admin${i}@ibbi.ac.id`,
                adminPassword,
                'admin'
            );
            adminIds.push(result.lastInsertRowid);
        }

        // Dosen
        const dosenIds = [];
        const dosenDataList = [];
        const dosenList = [
            { nama: 'Dr. Budi Santoso', nidn: '1234567890' },
            { nama: 'Prof. Siti Nurhaliza', nidn: '1234567891' },
            { nama: 'Dr. Ahmad Wijaya', nidn: '1234567892' },
            { nama: 'Ir. Dewi Lestari', nidn: '1234567893' },
            { nama: 'Dr. Rudi Hartono', nidn: '1234567894' },
            { nama: 'Prof. Eko Priyanto', nidn: '1234567895' },
            { nama: 'Dr. Wahyu Kusuma', nidn: '1234567896' },
            { nama: 'Ir. Bambang Sutrisno', nidn: '1234567897' },
            { nama: 'Dr. Heri Kurniawan', nidn: '1234567898' },
            { nama: 'Prof. Tri Sulistiyono', nidn: '1234567899' }
        ];

        for (const dosen of dosenList) {
            const result = db.prepare(`
                INSERT INTO pengguna (nama, email, password, peran)
                VALUES (?, ?, ?, ?)
            `).run(
                dosen.nama,
                dosen.nama.toLowerCase().replace(/\s+/g, '.') + '@ibbi.ac.id',
                dosenPassword,
                'dosen'
            );
            dosenIds.push(result.lastInsertRowid);
            dosenDataList.push({ penggunaId: result.lastInsertRowid, ...dosen });
        }

        // Mahasiswa
        const mahasiswaIds = [];
        const mahasiswaDataList = [];
        const nimList = [
            '23010001', '23010002', '23010003', '23010004', '23010005',
            '23010006', '23010007', '23010008', '23010009', '23010010',
            '23010011', '23010012', '23010013', '23010014', '23010015'
        ];
        const namaList = [
            'Adi Pratama', 'Bella Sanjaya', 'Citra Dewi', 'Dedi Mulyadi', 'Eka Putri',
            'Fajar Rahman', 'Gina Hermawan', 'Haris Suryanto', 'Indah Kusuma', 'Joko Widodo',
            'Kiki Amalia', 'Lintang Bima', 'Meisya Sakura', 'Novita Sari', 'Okta Prasetya'
        ];

        for (let i = 0; i < 15; i++) {
            const result = db.prepare(`
                INSERT INTO pengguna (nama, email, password, peran)
                VALUES (?, ?, ?, ?)
            `).run(
                namaList[i],
                `mahasiswa${i + 1}@ibbi.ac.id`,
                mahasiswaPassword,
                'mahasiswa'
            );
            mahasiswaIds.push(result.lastInsertRowid);
            mahasiswaDataList.push({ penggunaId: result.lastInsertRowid, nim: nimList[i], nama: namaList[i] });
        }

        // ===== SEED MAHASISWA =====
        console.log('📝 Seeding tabel mahasiswa...');
        const programStudiList = ['ti', 'si', 'it'];
        const angkatanList = [2021, 2022, 2023, 2024];
        const mahasiswaTableIds = [];

        for (let i = 0; i < mahasiswaDataList.length; i++) {
            const { penggunaId, nim, nama } = mahasiswaDataList[i];
            const programStudi = programStudiList[i % programStudiList.length];
            const angkatan = angkatanList[i % angkatanList.length];

            const result = db.prepare(`
                INSERT INTO mahasiswa (pengguna_id, nim, program_studi, angkatan)
                VALUES (?, ?, ?, ?)
            `).run(
                penggunaId,
                nim,
                programStudi,
                angkatan
            );
            mahasiswaTableIds.push(result.lastInsertRowid);
        }

        // ===== SEED DOSEN =====
        console.log('📝 Seeding tabel dosen...');
        const departemenOptions = ['fish', 'fast'];
        const dosenTableIds = [];

        for (let i = 0; i < dosenDataList.length; i++) {
            const { penggunaId, nidn } = dosenDataList[i];
            const departemen = departemenOptions[Math.floor(Math.random() * departemenOptions.length)];

            const result = db.prepare(`
                INSERT INTO dosen (pengguna_id, nidn, departemen)
                VALUES (?, ?, ?)
            `).run(
                penggunaId,
                nidn,
                departemen
            );
            dosenTableIds.push(result.lastInsertRowid);
        }

        // ===== SEED MATA_KULIAH =====
        console.log('📝 Seeding tabel mata_kuliah...');
        const mataKuliahList = [
            { kode: 'TI001', nama: 'Pemrograman Dasar', sks: 3 },
            { kode: 'TI002', nama: 'Struktur Data', sks: 3 },
            { kode: 'TI003', nama: 'Algoritma dan Kompleksitas', sks: 3 },
            { kode: 'TI004', nama: 'Basis Data', sks: 4 },
            { kode: 'TI005', nama: 'Sistem Operasi', sks: 3 },
            { kode: 'TI006', nama: 'Jaringan Komputer', sks: 3 },
            { kode: 'TI007', nama: 'Web Development', sks: 3 },
            { kode: 'TI008', nama: 'Mobile Development', sks: 3 },
            { kode: 'TI009', nama: 'Kecerdasan Buatan', sks: 3 },
            { kode: 'TI010', nama: 'Keamanan Siber', sks: 3 },
            { kode: 'TI011', nama: 'Cloud Computing', sks: 2 },
            { kode: 'TI012', nama: 'Machine Learning', sks: 3 }
        ];

        const mataKuliahIds = [];
        for (const mk of mataKuliahList) {
            const result = db.prepare(`
                INSERT INTO mata_kuliah (kode, nama, sks)
                VALUES (?, ?, ?)
            `).run(mk.kode, mk.nama, mk.sks);
            mataKuliahIds.push(result.lastInsertRowid);
        }

        // ===== SEED KELAS =====
        console.log('📝 Seeding tabel kelas...');
        const semesterList = ['1', '2', '3', '4', '5', '6'];
        const kelasIds = [];

        for (let i = 0; i < 12; i++) {
            const mataKuliahId = mataKuliahIds[i % mataKuliahIds.length];
            const dosenId = dosenTableIds[i % dosenTableIds.length];
            const semester = semesterList[i % semesterList.length];
            const namaKelas = `Kelas ${String.fromCharCode(65 + (i % 3))}`;

            const result = db.prepare(`
                INSERT INTO kelas (mata_kuliah_id, dosen_id, nama_kelas, semester, tahun_akademik)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                mataKuliahId,
                dosenId,
                namaKelas,
                semester,
                '2024/2025'
            );
            kelasIds.push(result.lastInsertRowid);
        }

        // ===== SEED PESERTA_KELAS =====
        console.log('📝 Seeding tabel peserta_kelas...');
        let pesertaCount = 0;

        for (const kelasId of kelasIds.slice(0, 10)) {
            const jumlahPeserta = 10 + Math.floor(Math.random() * 3);
            const shuffledIndices = mahasiswaTableIds.sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < jumlahPeserta && i < shuffledIndices.length; i++) {
                db.prepare(`
                    INSERT INTO peserta_kelas (mahasiswa_id, kelas_id)
                    VALUES (?, ?)
                `).run(
                    shuffledIndices[i],
                    kelasId
                );
                pesertaCount++;
            }
        }

        // ===== SEED SESI_ABSENSI =====
        console.log('📝 Seeding tabel sesi_absensi...');
        const sesiIds = [];
        const topikList = [
            'Pengenalan Konsep Dasar',
            'Implementasi Praktis',
            'Studi Kasus Real-world',
            'Diskusi dan QA',
            'Tutorial Hands-on',
            'Ulangan Harian',
            'Project Presentation',
            'Kuis'
        ];

        let currentDate = new Date('2024-11-01');

        for (const kelasId of kelasIds.slice(0, 10)) {
            for (let pertemuan = 1; pertemuan <= 12; pertemuan++) {
                const topik = topikList[Math.floor(Math.random() * topikList.length)];
                const tanggal = new Date(currentDate);
                tanggal.setDate(tanggal.getDate() + (pertemuan - 1) * 7);

                const result = db.prepare(`
                    INSERT INTO sesi_absensi (kelas_id, pertemuan_ke, topik, tanggal, jam_mulai, jam_selesai)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(
                    kelasId,
                    pertemuan,
                    topik,
                    tanggal.toISOString().split('T')[0],
                    '08:00',
                    '10:00'
                );
                sesiIds.push(result.lastInsertRowid);
            }
        }

        // ===== SEED ABSENSI =====
        console.log('📝 Seeding tabel absensi...');

        const allPeserta = db.prepare(`
            SELECT pk.id, pk.mahasiswa_id, pk.kelas_id FROM peserta_kelas pk
        `).all();

        const sesiPerKelas = db.prepare(`
            SELECT id, kelas_id FROM sesi_absensi
        `).all();

        let absensiCount = 0;
        
        for (const sesi of sesiPerKelas) {
            const pesertaForKelas = allPeserta.filter(p => p.kelas_id === sesi.kelas_id);
            
            for (const peserta of pesertaForKelas) {
                const random = Math.random();
                let finalStatus = 'hadir';
                if (random < 0.05) finalStatus = 'alpha';
                else if (random < 0.10) finalStatus = 'sakit';
                else if (random < 0.20) finalStatus = 'izin';

                db.prepare(`
                    INSERT INTO absensi (sesi_id, mahasiswa_id, status, waktu_absen)
                    VALUES (?, ?, ?, DATETIME('now', '-' || ? || ' days'))
                `).run(
                    sesi.id,
                    peserta.mahasiswa_id,
                    finalStatus,
                    Math.floor(Math.random() * 30)
                );
                absensiCount++;
            }
        }

        console.log('\n✅ Seeding berhasil!');
        console.log(`   • Pengguna: ${adminIds.length + dosenTableIds.length + mahasiswaTableIds.length}`);
        console.log(`   • Mahasiswa: ${mahasiswaTableIds.length}`);
        console.log(`   • Dosen: ${dosenTableIds.length}`);
        console.log(`   • Mata Kuliah: ${mataKuliahIds.length}`);
        console.log(`   • Kelas: ${kelasIds.length}`);
        console.log(`   • Peserta Kelas: ${pesertaCount}`);
        console.log(`   • Sesi Absensi: ${sesiIds.length}`);
        console.log(`   • Absensi: ${absensiCount}`);
        console.log('\n🎉 Database siap digunakan!\n');

    } catch (error) {
        console.error('❌ Error saat seeding:', error);
        process.exit(1);
    }
}

seedDatabase().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
