const router = require('express').Router();

const DosenController = require('../controllers/DosenController');

router.get('/create', DosenController.showCreateForm);

router.get('/list', DosenController.listDosen);

router.get('/edit/:id', DosenController.showEditForm);

router.post('/create', DosenController.createDosen);

router.post('/edit/:id', DosenController.editDosen);

router.post('/delete/:id', DosenController.deleteDosen);

module.exports = router;