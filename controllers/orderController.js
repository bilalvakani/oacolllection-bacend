const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      user
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      orderItems,
      user: user || req.user?._id, // Use provided user ID or authenticated user
      shippingAddress,
      paymentMethod,
      totalPrice
    });

    const createdOrder = await order.save();

    // Fetch user details for the email
    const User = require('../models/User');
    const orderUser = await User.findById(user || req.user?._id);

    // Build order items HTML
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
    const itemsHtml = orderItems.map(item => {
      // Ensure image URL is absolute for email clients, unless it is a base64 data URI
      let imgUrl = item.image;
      if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
        const baseUrl = process.env.BACKEND_URL || FRONTEND_URL || 'http://localhost:5000';
        imgUrl = imgUrl.startsWith('/') ? `${baseUrl}${imgUrl}` : `${baseUrl}/${imgUrl}`;
      }
      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <img src="${imgUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <p style="margin: 0; font-weight: bold; color: #333;">${item.name}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Qty: ${item.qty}</p>
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">
            Rs. ${(item.price * item.qty).toLocaleString()}
          </td>
        </tr>
      `;
    }).join('');

    // Send email to customer
    if (orderUser && orderUser.email) {
      await sendEmail({
        to: orderUser.email,
        subject: `OA Collection - Order Confirmed #${createdOrder._id.toString().slice(-6).toUpperCase()}`,
        html: `
          <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
            <div style="background: #0f172a; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">OA Collection</h1>
              <p style="color: #94a3b8; margin-top: 10px; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Order Confirmation</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin-top: 0;">Hi ${orderUser.firstName},</h2>
              <p style="color: #475569; line-height: 1.6; font-size: 15px;">Thank you for your purchase! We're getting your order ready to be shipped. We will notify you when it has been sent.</p>
              
              <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 12px;">
                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Order Number</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: #0f172a; font-weight: 900; letter-spacing: 1px;">#${createdOrder._id.toString().slice(-6).toUpperCase()}</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding: 20px 15px; text-align: right; color: #64748b; font-weight: bold;">Shipping:</td>
                  <td style="padding: 20px 15px; text-align: right; color: #0f172a; font-weight: bold;">Rs. 250</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 15px; text-align: right; font-size: 18px; color: #0f172a; font-weight: 900;">Total:</td>
                  <td style="padding: 15px; text-align: right; font-size: 18px; color: #0f172a; font-weight: 900;">Rs. ${totalPrice.toLocaleString()}</td>
                </tr>
              </table>

              <div style="margin-bottom: 40px;">
                <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Delivery Details</h3>
                <p style="color: #475569; margin: 5px 0; font-size: 14px;"><strong>${shippingAddress.fullName}</strong></p>
                <p style="color: #475569; margin: 5px 0; font-size: 14px;">${shippingAddress.address}</p>
                <p style="color: #475569; margin: 5px 0; font-size: 14px;">${shippingAddress.city}, ${shippingAddress.zipCode}</p>
                <p style="color: #475569; margin: 5px 0; font-size: 14px;">${shippingAddress.phone}</p>
              </div>

              <div style="text-align: center;">
                <a href="${FRONTEND_URL}/profile" style="display: inline-block; padding: 16px 40px; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Track Your Order</a>
              </div>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">If you have any questions, reply to this email or contact us at support@oacollection.com</p>
            </div>
          </div>
        `
      });
    }

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@oacollection.com',
      subject: `New Order Alert - #${createdOrder._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #ef4444; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase;">New Order Received</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;"><strong>Customer:</strong> ${orderUser?.firstName || 'Guest'} ${orderUser?.lastName || ''}</p>
            <p style="font-size: 16px; color: #333;"><strong>Email:</strong> ${orderUser?.email || 'N/A'}</p>
            <p style="font-size: 16px; color: #333;"><strong>Phone:</strong> ${shippingAddress.phone}</p>
            
            <h3 style="margin-top: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Order Summary (Rs. ${totalPrice.toLocaleString()})</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
            </table>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${FRONTEND_URL}/admin/orders" style="display: inline-block; padding: 12px 30px; background: #ef4444; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">View in Admin Panel</a>
            </div>
          </div>
        </div>
      `
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?._id;
    const orders = await Order.find({ user: userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id firstName lastName');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get dashboard stats
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const orders = await Order.find({});
    
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalOrders = orders.length;
    
    // Sort orders by date descending and get top 5
    const recentOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
