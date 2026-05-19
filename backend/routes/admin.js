const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  adminDeleteProduct,
  adminCreateProduct,
  adminUpdateProduct
} = require('../controllers/adminController');
const { protect, adminProtect } = require('../middleware/auth');

router.use(protect, adminProtect);

router.get('/stats', getAdminStats);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.post('/products', adminCreateProduct);
router.put('/products/:id', adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);

module.exports = router;
