const DosenModel = require('../models/Dosen');

function showCreateForm(req, res) {
  res.render('pages/dosen/create');
}

function listDosen(req, res) {
  const dosen = DosenModel.ambilSemuaDosen();

  res.render('pages/dosen/list', { dosen });
}

function showEditForm(req, res) {
  const { id } = req.params;

  const dosen = DosenModel.ambilDosenById(id);

  res.render('pages/dosen/edit', { dosen });
}

function createDosen(req, res) {
  const { nidn, nama, email, departemen } = req.body;

  DosenModel.buatDosen(nidn, nama, email, departemen);

  res.redirect('/dosen/list');
}

function editDosen(req, res) {
  const { id } = req.params;
  const { nidn, nama, email, departemen } = req.body;

  DosenModel.updateDosen(id, nidn, nama, email, departemen);

  res.redirect('/dosen/list');
}

function deleteDosen(req, res) {
  const { id } = req.params;

  DosenModel.hapusDosen(id);

  res.redirect('/dosen/list');
}

module.exports = {
  showCreateForm,
  listDosen,
  showEditForm,
  createDosen,
  editDosen,
  deleteDosen
}
