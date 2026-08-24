const router    = require('express').Router();
const auth      = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const ctrl      = require('../controllers/waitlistController');

router.post('/join',          auth, roleGuard('customer'), ctrl.joinWaitlist);
router.get('/accept/:token',  ctrl.acceptOffer);             // public — token is the credential
router.get('/position',       auth, roleGuard('customer'), ctrl.getWaitlistPosition);

module.exports = router;
