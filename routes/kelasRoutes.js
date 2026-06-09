const router = require('express').Router();
const KelasController = require('../controllers/KelasController');

router.get('/list', KelasController.listKelas);
router.get('/create', KelasController.showCreateForm);
router.post('/create', KelasController.createKelas);
router.get('/edit/:id', KelasController.showEditForm);
router.post('/edit/:id', KelasController.editKelas);
router.post('/delete/:id', KelasController.deleteKelas);

module.exports = router;
