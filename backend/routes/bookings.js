const router    = require('express').Router();
const auth      = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const ctrl      = require('../controllers/bookingController');

router.use(auth);
router.post('/hold',         roleGuard('customer'), ctrl.holdSeats);
router.post('/confirm',      roleGuard('customer'), ctrl.confirmBooking);
router.get('/my',            roleGuard('customer'), ctrl.getMyBookings);
router.post('/:id/cancel',   roleGuard('customer'), ctrl.cancelBooking);

module.exports = router;
