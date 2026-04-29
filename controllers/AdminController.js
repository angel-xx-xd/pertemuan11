const AdminModel = require('../models/Admin');

function validateAdmin(nama, email) {
  /* 
    admin
    - nama
        - nama wajib diisi
        - nama minimal 3 karakter
        - nama hanya boleh huruf dan spasi
    - email
        - email wajib diisi
        - format email valid (regex) 
  */

  const pesanError = [];

  if(!nama || nama.trim() === '') {
      pesanError.push("Nama admin tidak boleh kosong");
  }else if(nama.trim().length < 3) {
      pesanError.push("Nama admin harus terdiri dari minimal 3 karakter");
  }else if(!/^[a-zA-Z\s]+$/.test(nama.trim())) {
      pesanError.push("Nama admin hanya boleh mengandung huruf dan spasi");
  }

  if(!email || email.trim() === '') {
      pesanError.push("Email admin tidak boleh kosong");
  }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      pesanError.push("Format email admin tidak valid");
  }

  return pesanError;
}

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

  const pesanError = validateAdmin(nama, email);

  // mengirimkan pesan error ke view jika ada error
  if(pesanError.length > 0) {
      res.render('pages/admin/create', { 
          pesanError, 
          formData : { nama, email }
      });
      return;
  }

  AdminModel.buatAdmin(nama, email);

  res.redirect('/admin/list');
}

function editAdmin(req, res) {
  const { id } = req.params;
  const { nama, email } = req.body;

  const pesanError = validateAdmin(nama, email);

  // mengirimkan pesan error ke view jika ada error
  if(pesanError.length > 0) {
      res.render('pages/admin/edit', { 
          pesanError, 
          admin : { id, nama, email }
      });
      return;
  }

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
