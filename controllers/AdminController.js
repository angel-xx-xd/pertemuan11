const AdminModel = require('../models/Admin');

function showCreateForm(req, res) {
  res.render('pages/admin/create');
}

function listAdmin(req, res) {
  const admin = AdminModel.ambilSemuaAdmin();

  res.render('pages/admin/list', { admin });
}

function showEditForm(req, res) {
  const { id } = req.params;

  const admin = AdminModel.ambilAdminById(id);

  res.render('pages/admin/edit', { admin });
}

function createAdmin(req, res) {
  const { nama, email } = req.body;

  AdminModel.buatAdmin(nama, email);

  res.redirect('/admin/list');
}

function editAdmin(req, res) {
  const { id } = req.params;
  const { nama, email } = req.body;

  AdminModel.updateAdmin(id, nama, email);
  
  res.redirect('/admin/list');
}

function deleteAdmin(req, res) {
  const { id } = req.params;

  AdminModel.hapusAdmin(id);

  res.redirect('/admin/list');
}

module.exports = {
  showCreateForm,
  listAdmin,
  showEditForm,
  createAdmin,
  editAdmin,
  deleteAdmin
}
