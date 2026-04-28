const MahasiswaModel = require('../models/Admin');

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

  MahasiswaModel.buatMahasiswa(nim, nama, email, program_studi, angkatan);

  res.redirect('/mahasiswa/list');
}

function editMahasiswa(req, res) {
  const { id } = req.params;
  const { nim, nama, email, program_studi, angkatan } = req.body;

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
