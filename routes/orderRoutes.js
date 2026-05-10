const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getOrders, updateOrderStatus, getStats } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/stats', getStats);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);

module.exports = router;
