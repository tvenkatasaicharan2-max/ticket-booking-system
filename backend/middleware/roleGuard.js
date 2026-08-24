/**
 * Role-based access guard.
 * Usage: roleGuard('admin') or roleGuard('organiser', 'admin')
 */
module.exports = function roleGuard(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};
