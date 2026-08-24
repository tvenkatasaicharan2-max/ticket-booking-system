const router    = require('express').Router();
const auth      = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const ctrl      = require('../controllers/adminController');

// GET /venues — auth only (organisers need to list venues for event creation)
router.get('/venues',        auth, ctrl.listVenues);
router.get('/users',         auth, roleGuard('admin'), ctrl.listAllUsers);
router.post('/venues',       auth, roleGuard('admin'), ctrl.createVenue);
router.put('/venues/:id',    auth, roleGuard('admin'), ctrl.updateVenue);
router.delete('/venues/:id', auth, roleGuard('admin'), ctrl.deleteVenue);

module.exports = router;
