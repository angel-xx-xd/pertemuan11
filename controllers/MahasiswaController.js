const MahasiswaModel = require('../models/Mahasiswa');

function validateMahasiswa(nim, nama, email, program_studi, angkatan) {
  const pesanError = [];

  /* mahasiswa
   - nim
        - wajib diisi
        - berisi 8 - 15 digit angka
   - nama
        - wajib diisi
        - minimal 3 karakter
        - hanya boleh huruf dan spasi
   - email
        - wajib diisi
        - format email valid
    - program studi
        - wajib dipilih
        - pilihan valid (ti, si atau it)
    - angkatan
         - wajib diisi
         - diantara 2000 - 2100
          */

  if(!nim || nim.trim() === '') {
      pesanError.push("NIM mahasiswa tidak boleh kosong");
  }else if(!/^\d{8,15}$/.test(nim.trim())) {
      pesanError.push("NIM mahasiswa harus terdiri dari 8 sampai 15 digit angka");
  }

  if(!nama || nama.trim() === '') {
      pesanError.push("Nama mahasiswa tidak boleh kosong");
  }else if(nama.trim().length < 3) {
      pesanError.push("Nama mahasiswa harus terdiri dari minimal 3 karakter");
  }else if(!/^[a-zA-Z\s]+$/.test(nama.trim())) {
      pesanError.push("Nama mahasiswa hanya boleh mengandung huruf dan spasi");
  }

  if(!email || email.trim() === '') {
      pesanError.push("Email mahasiswa tidak boleh kosong");
  }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      pesanError.push("Format email mahasiswa tidak valid");
  }

  if(!program_studi || (program_studi !== 'ti' && program_studi !== 'si' && program_studi !== 'it')) {
      pesanError.push("Program studi mahasiswa harus dipilih dan valid");
  }

  if(!angkatan || isNaN(angkatan) || angkatan < 2000 || angkatan > 2100) {
      pesanError.push("Angkatan mahasiswa harus diisi dan antara 2000 sampai 2100");
  }

  return pesanError;
}

function showCreateForm(req, res) {
  res.render('pages/mahasiswa/create');
}

function listMahasiswa(req, res) {
    const mahasiswa = MahasiswaModel.ambilSemuaMahasiswa();
  

  res.render('pages/mahasiswa/list', { mahasiswa });
}

function showEditForm(req, res) {
  const { id } = req.params;

  const mahasiswa = MahasiswaModel.ambilMahasiswaById(id);

  res.render('pages/mahasiswa/edit', { mahasiswa });
}

function createMahasiswa(req, res) {
  const { nim, nama, email, program_studi, angkatan } = req.body;

  const pesanError = validateMahasiswa(nim, nama, email, program_studi, angkatan);

  if(pesanError.length > 0) {
      res.render('pages/mahasiswa/create', { 
          pesanError, 
          formData : { nim, nama, email, program_studi, angkatan }
      });
      return;
  }

  MahasiswaModel.buatMahasiswa(nim, nama, email, program_studi, angkatan);

  res.redirect('/mahasiswa/list');
}

function editMahasiswa(req, res) {
  const { id } = req.params;
  const { nim, nama, email, program_studi, angkatan } = req.body;

  const pesanError = validateMahasiswa(nim, nama, email, program_studi, angkatan);
  
  if(pesanError.length > 0) {
      res.render('pages/mahasiswa/edit', {
          pesanError,
          mahasiswa : { id, nim, nama, email, program_studi, angkatan }
      });
      return;
  }
  
  MahasiswaModel.updateMahasiswa(id, nim, nama, email, program_studi, angkatan);

  res.redirect('/mahasiswa/list');
}

function deleteMahasiswa(req, res) {
  const { id } = req.params;

  MahasiswaModel.hapusMahasiswa(id);

  res.redirect('/mahasiswa/list');
}

module.exports = {
  showCreateForm,
  listMahasiswa,
  showEditForm,
  createMahasiswa,
  editMahasiswa,
  deleteMahasiswa
}
