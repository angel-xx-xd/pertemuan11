const router = require('express').Router();

const AdminController = require('../controllers/AdminController');

router.get('/create', AdminController.showCreateForm);

router.get('/list', AdminController.listAdmin);

router.get('/edit/:id', AdminController.showEditForm);

router.post('/create', AdminController.createAdmin);

router.post('/edit/:id', AdminController.editAdmin);

router.post('/delete/:id', AdminController.deleteAdmin);

module.exports = router;