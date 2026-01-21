const express = require('express');
const router = express.Router();
const { 
  getUserAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress 
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getUserAddresses)
  .post(protect, addAddress);

router.route('/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

module.exports = router;