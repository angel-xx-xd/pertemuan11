const router = require('express').Router();

const MahasiswaController = require('../controllers/MahasiswaController');

router.get('/create', MahasiswaController.showCreateForm);

router.get('/list', MahasiswaController.listMahasiswa);

router.get('/edit/:id', MahasiswaController.showEditForm);

router.post('/create', MahasiswaController.createMahasiswa);

router.post('/edit/:id', MahasiswaController.editMahasiswa);

router.post('/delete/:id', MahasiswaController.deleteMahasiswa);

module.exports = router;