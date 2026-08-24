const router    = require('express').Router();
const auth      = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const ctrl      = require('../controllers/eventController');

// Public
router.get('/',              ctrl.listEvents);
router.get('/:id',           ctrl.getEventById);
router.get('/:id/seatmap',   ctrl.getSeatMap);

// Authenticated organiser/admin
router.get('/organiser/mine', auth, roleGuard('organiser', 'admin'), ctrl.getOrganiserEvents);
router.get('/:id/summary',    auth, roleGuard('organiser', 'admin'), ctrl.getEventSummary);
router.post('/',              auth, roleGuard('organiser', 'admin'), ctrl.createEvent);
router.put('/:id',            auth, roleGuard('organiser', 'admin'), ctrl.updateEvent);
router.delete('/:id',         auth, roleGuard('organiser', 'admin'), ctrl.cancelEvent);

module.exports = router;
