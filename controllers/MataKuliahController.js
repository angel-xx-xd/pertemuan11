const MataKuliahModel = require('../models/MataKuliah');

function validateMataKuliah(kode, nama, sks) {
    const pesanError = [];

    //validasi
    if(!kode || kode.trim() === '') {
        pesanError.push("Kode mata kuliah tidak boleh kosong");
    }else if(kode.trim().length < 3) {
        pesanError.push("Kode mata kuliah harus terdiri dari minimal 3 karakter");
    }else if(!/^[a-zA-Z0-9]+$/.test(kode.trim())) {
        pesanError.push("Kode mata kuliah hanya boleh mengandung huruf dan angka");
    }

    if(!nama || nama.trim() === '') {
        pesanError.push("Nama mata kuliah tidak boleh kosong");
    }else if(nama.trim().length < 4) {
        pesanError.push("Nama mata kuliah harus terdiri dari minimal 4 karakter");
    }

    if(!sks || isNaN(sks) || sks <= 0) {
        pesanError.push("SKS harus berupa angka positif");
    }else if(sks < 1 || sks > 6) {
        pesanError.push("SKS harus antara 1 sampai 6");
    }   

    return pesanError;
}

function listMataKuliah(req, res) {
    const mataKuliah = MataKuliahModel.ambilSemuaMataKuliah();

    res.render('pages/mata-kuliah/list', { mataKuliah });
}

function showCreateForm(req, res) {
    res.render('pages/mata-kuliah/create');
}

function showEditForm(req, res) {
    const { id } = req.params;
    const mataKuliah = MataKuliahModel.ambilMataKuliahById(id);

    res.render('pages/mata-kuliah/edit', { mataKuliah });
}

function createMataKuliah(req, res) {
    const { nama, kode, sks } = req.body;

    const pesanError = validateMataKuliah(kode, nama, sks);

    // mengirimkan pesan error ke view jika ada error
    if(pesanError.length > 0) {
        res.render('pages/mata-kuliah/create', { 
            pesanError, 
            formData : { nama, kode, sks }
        });
        return;
    }
    

    // simpan ke database 
    MataKuliahModel.buatMataKuliah(nama, kode, sks);

    res.redirect('/mata-kuliah/list');
}

function editMataKuliah(req, res) {
    const { nama, kode, sks } = req.body;
    const { id } = req.params;

    const pesanError = validateMataKuliah(kode, nama, sks);

    // mengirimkan pesan error ke view jika ada error
    if(pesanError.length > 0) {
        res.render('pages/mata-kuliah/edit', { 
            pesanError, 
            mataKuliah : { id, nama, kode, sks }
        });
        return;
    }

    MataKuliahModel.updateMataKuliah(id, nama, kode, sks);

    res.redirect('/mata-kuliah/list');
}

function deleteMataKuliah(req, res) {
    const { id } = req.params;
    MataKuliahModel.hapusMataKuliah(id);

    res.redirect('/mata-kuliah/list');
}

module.exports = {
    listMataKuliah,
    showCreateForm,
    showEditForm,
    createMataKuliah,
    editMataKuliah,
    deleteMataKuliah
}