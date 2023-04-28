const router = require('express').Router();

const {
  // getUsers,
  login,
  register,
  // logout,
  // clearcookie,
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/auth/login', login);
router.post('/auth/register', register);
// router.get('/auth/user', isAuthenticated, getUsers);
// router.delete('/auth/logout', isAuthenticated, logout);
// router.get('/auth/clearcookie', clearcookie);

module.exports = router;
