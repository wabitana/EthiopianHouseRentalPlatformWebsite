import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

const DEFAULT_PACKAGES = [
  { id: 'pkg-1', name: 'Deep Cleaning & Sanitization', type: 'CLEANING', priceETB: 1500, features: ['Living Room & Bedrooms', 'Kitchen Disinfection', 'Bathroom Scrubbing'] },
  { id: 'pkg-2', name: 'On-Site Property Inspection', type: 'INSPECTION', priceETB: 800, features: ['Structural Verification', 'Deed & Document Validation', 'High-Res Photo Audit'] },
  { id: 'pkg-3', name: 'Relocation & Logistics', type: 'LOGISTICS', priceETB: 3500, features: ['Furniture Packing', 'Truck Transportation', 'Unloading & Assembly'] },
];

// In-memory Cart & Order store for web marketplace and vendor services
interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    vendor: { businessName: string };
  };
}

const userCarts = new Map<string, CartItem[]>();
const userOrders = new Map<string, any[]>();
const userBookings = new Map<string, any[]>();

// GET /api/v1/services/packages
router.get('/packages', async (_req, res) => {
  return res.json({ packages: DEFAULT_PACKAGES });
});

// GET /api/v1/services/slots
router.get('/slots', async (req, res) => {
  const { date, type } = req.query;
  const times = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
  const slots = times.map((t) => ({ time: t, available: true }));
  return res.json({ date: date || new Date().toISOString().split('T')[0], type: type || 'INSPECTION', slots });
});

// POST /api/v1/services/book
router.post('/book', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { type, address, estimatedPrice } = req.body;
  if (!type || !address || !estimatedPrice) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  const bookingNumber = `SRV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const booking = {
    id: `booking-${Date.now()}`,
    bookingNumber,
    userId,
    type,
    status: 'PENDING',
    address,
    estimatedPrice,
    createdAt: new Date().toISOString(),
  };

  const currentBookings = userBookings.get(userId) || [];
  currentBookings.unshift(booking);
  userBookings.set(userId, currentBookings);

  await prisma.notification.create({
    data: {
      userId,
      title: 'Service Booking Created!',
      message: `Your booking #${bookingNumber} (${type}) has been placed. We will contact you for confirmation.`,
      type: 'SYSTEM',
    },
  });

  return res.status(201).json({
    success: true,
    booking,
  });
});

// GET /api/v1/services/book & /api/v1/services/bookings
const handleGetBookings = async (req: AuthRequest, res: any) => {
  const userId = req.user?.id;
  const bookings = userId ? (userBookings.get(userId) || []) : [];
  return res.json({ bookings });
};
router.get('/book', authenticateToken, handleGetBookings);
router.get('/bookings', authenticateToken, handleGetBookings);

// GET /api/v1/addresses
router.get('/addresses', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const defaultAddress = user?.address
    ? [{ id: 'addr-default', label: 'Primary Residence', address: user.address, city: user.city || 'Addis Ababa', isDefault: true }]
    : [];

  return res.json({ addresses: defaultAddress });
});

// POST /api/v1/addresses
router.post('/addresses', authenticateToken, async (req: AuthRequest, res) => {
  const { label, address, city } = req.body;
  return res.status(201).json({
    success: true,
    address: {
      id: `addr-${Date.now()}`,
      label: label || 'Home',
      address,
      city: city || 'Addis Ababa',
      isDefault: true,
    },
  });
});

// ==========================================
// DEDICATED CART ROUTER (/api/v1/cart & /api/cart)
// ==========================================
export const cartRoutes = Router();

cartRoutes.get('/', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const items = userCarts.get(userId) || [];
  return res.json({ items });
});

cartRoutes.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const property = await prisma.property.findUnique({ where: { id: productId } }).catch(() => null);
  const pkg = DEFAULT_PACKAGES.find((p) => p.id === productId);

  const productName = property?.title || pkg?.name || `Marketplace Item ${productId.substring(0, 6)}`;
  const productPrice = property?.price || pkg?.priceETB || 2500;

  const currentItems = userCarts.get(userId) || [];
  const existingIdx = currentItems.findIndex((i) => i.product.id === productId);

  if (existingIdx >= 0) {
    currentItems[existingIdx].quantity += Number(quantity);
  } else {
    currentItems.push({
      id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quantity: Number(quantity),
      product: {
        id: productId,
        name: productName,
        price: productPrice,
        stock: 10,
        vendor: { businessName: property?.providerName || 'Delala Verified Provider' },
      },
    });
  }

  userCarts.set(userId, currentItems);
  return res.status(201).json({ success: true, items: currentItems });
});

cartRoutes.patch('/', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { productId, quantity } = req.body;

  const currentItems = userCarts.get(userId) || [];
  const updatedItems = currentItems
    .map((item) => (item.product.id === productId ? { ...item, quantity: Number(quantity) } : item))
    .filter((item) => item.quantity > 0);

  userCarts.set(userId, updatedItems);
  return res.json({ success: true, items: updatedItems });
});

cartRoutes.delete('/', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { productId } = req.body;

  const currentItems = userCarts.get(userId) || [];
  const updatedItems = productId ? currentItems.filter((i) => i.product.id !== productId) : [];

  userCarts.set(userId, updatedItems);
  return res.json({ success: true, items: updatedItems });
});

// ==========================================
// DEDICATED ORDERS ROUTER (/api/v1/orders & /api/orders)
// ==========================================
export const ordersRoutes = Router();

ordersRoutes.get('/', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const orders = userOrders.get(userId) || [];
  return res.json({ orders });
});

ordersRoutes.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const orders = userOrders.get(userId) || [];
  const order = orders.find((o) => o.id === id || o.orderNumber === id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.json({
    order,
    timeline: [
      { title: 'Order Placed', date: new Date(order.createdAt).toLocaleDateString(), completed: true },
      { title: 'Processing & Verification', date: new Date(order.createdAt).toLocaleDateString(), completed: true },
      { title: 'Dispatch & Delivery', date: 'In Progress', completed: false },
    ],
  });
});

ordersRoutes.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { shippingAddress, shippingCity, notes, paymentMethod } = req.body;

  const cartItems = userCarts.get(userId) || [];
  const total = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0) || 1500;

  const orderNumber = `DEL-${Date.now().toString().slice(-6)}`;
  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    userId,
    status: 'PROCESSING',
    total,
    shippingAddress,
    shippingCity: shippingCity || 'Addis Ababa',
    notes: notes || '',
    paymentMethod: paymentMethod || 'CHAPA',
    items: cartItems.length > 0 ? cartItems : [{ id: 'item-1', product: { name: 'Standard Inspection Package', price: 1500 }, quantity: 1 }],
    payment: { status: 'PAID', method: paymentMethod || 'Chapa' },
    createdAt: new Date().toISOString(),
  };

  const existingOrders = userOrders.get(userId) || [];
  existingOrders.unshift(newOrder);
  userOrders.set(userId, existingOrders);

  // Clear user cart on successful checkout
  userCarts.set(userId, []);

  if (userId !== 'guest') {
    await prisma.notification.create({
      data: {
        userId,
        title: 'Order Confirmed! 📦',
        message: `Your order #${orderNumber} for ${total.toLocaleString()} ETB has been received and is being processed.`,
        type: 'PAYMENT',
      },
    }).catch(() => null);
  }

  return res.status(201).json({
    success: true,
    order: newOrder,
    redirect: `/orders/${newOrder.id}`,
  });
});

// Mount cart & orders as sub-routes on main vendor router for fallback compatibility
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);

export default router;
