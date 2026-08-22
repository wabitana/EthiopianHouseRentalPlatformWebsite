import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import {
  authRoutes,
  propertyRoutes,
  providerRoutes,
  favoritesRoutes,
  inquiriesRoutes,
  notificationsRoutes,
  reportRoutes,
  adminRoutes,
  uploadRoutes,
  aiRoutes,
  subscriptionRoutes,
  verificationRoutes,
  rentalRoutes,
  saleRoutes,
  cmsRoutes,
  vendorServicesRoutes,
  agentRoutes,
  telegramRoutes,
} from './modules';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://10.0.2.2:3000',
  'http://10.0.2.2:3001',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.0.2.2:')
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true, // Required for cross-origin cookies
}));
app.use(cookieParser()); // Populate req.cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Static uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// REST API v1 Modular Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/provider', providerRoutes);
app.use('/api/v1/favorites', favoritesRoutes);
app.use('/api/v1/inquiries', inquiriesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/chat', aiRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/rentals', rentalRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/services', vendorServicesRoutes);
app.use('/api/v1/addresses', vendorServicesRoutes);
app.use('/api/v1/agent', agentRoutes);
app.use('/api/v1/telegram', telegramRoutes);

// Backward compatibility proxies for web app legacy routes
app.use('/api/cms', cmsRoutes);
app.use('/api/services', vendorServicesRoutes);
app.use('/api/addresses', vendorServicesRoutes);
app.use('/api/bookings', vendorServicesRoutes);
app.use('/api/chat', aiRoutes);

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Ethiopian Property Platform REST API', version: 'v1' });
});

// Interactive Chapa Checkout UI endpoint
app.get('/payments/simulated-checkout', (req, res) => {
  const ref = req.query.ref || 'chapa_tx_simulated';
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chapa Checkout</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: #0b1426; color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .checkout-card { background-color: #132238; border-radius: 16px; width: 100%; max-width: 850px; display: flex; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid #1e3a5f; }
    .sidebar { width: 40%; background-color: #0f1b2e; padding: 32px 24px; border-right: 1px solid #1e3a5f; display: flex; flex-direction: column; gap: 20px; }
    .main-content { width: 60%; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; }
    .brand-header { display: flex; align-items: center; justify-space-between; margin-bottom: 24px; }
    .chapa-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 22px; color: #ffffff; }
    .chapa-icon { width: 32px; height: 32px; background-color: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; }
    .method-option { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 10px; border: 1px solid #1e3a5f; cursor: pointer; transition: all 0.2s; }
    .method-option.active { background-color: #163828; border-color: #22c55e; }
    .method-title { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; }
    .sim-badge { color: #94a3b8; font-size: 13px; margin-bottom: 12px; }
    .sim-info { background-color: rgba(30, 58, 95, 0.4); border-radius: 8px; padding: 12px; font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px; }
    .input-group { margin-bottom: 24px; }
    .input-label { display: block; font-size: 13px; font-weight: 600; color: #e2e8f0; margin-bottom: 8px; }
    .input-box { width: 100%; padding: 14px 16px; background-color: #0f1b2e; border: 1px solid #1e3a5f; border-radius: 10px; color: #ffffff; font-size: 15px; outline: none; }
    .pay-btn { width: 100%; padding: 16px; background-color: #65a30d; color: #ffffff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background-color 0.2s; }
    .pay-btn:hover { background-color: #4d7c0f; }
    .footer-secure { margin-top: 24px; color: #64748b; font-size: 13px; display: flex; align-items: center; gap: 6px; }
  </style>
</head>
<body>
  <div class="checkout-card">
    <div class="sidebar">
      <div class="chapa-logo">
        <div class="chapa-icon">⚡</div>
        <span>Chapa</span>
      </div>
      <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">Select your payment method here</p>
      
      <div class="method-option active">
        <div class="method-title">
          <span>🏦</span> Test Bank Payment
        </div>
        <span>›</span>
      </div>
      <div class="method-option">
        <div class="method-title">
          <span>💳</span> Test Card Payment
        </div>
        <span>›</span>
      </div>
    </div>
    
    <div class="main-content">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700;">
            <span style="color: #22c55e;">⚡</span> Chapa Checkout
          </div>
          <span style="font-size: 12px; color: #94a3b8;">EN ▾</span>
        </div>
        
        <p class="sim-badge">hi this is simulation</p>
        <div class="sim-info">
          No actual money is used in the test mode. Only our test cards and bank accounts can be used.
        </div>
        
        <div class="input-group">
          <label class="input-label">Phone Number</label>
          <input type="text" class="input-box" value="0911000000" id="phoneInput">
        </div>
      </div>
      
      <button class="pay-btn" onclick="processPayment()">Pay using Test Mode</button>
    </div>
  </div>
  
  <div class="footer-secure">
    🔒 Secured By Chapa
  </div>

  <script>
    function processPayment() {
      const btn = document.querySelector('.pay-btn');
      btn.innerText = 'Processing Payment...';
      btn.style.opacity = '0.7';
      setTimeout(() => {
        btn.innerText = '✓ Payment Successful!';
        btn.style.backgroundColor = '#22c55e';
        setTimeout(() => {
          alert('Subscription payment successful via Chapa Payment Gateway!');
          window.close();
        }, 800);
      }, 1000);
    }
  </script>
</body>
</html>
  `);
});

// Centralized error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  return res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal server error occurred',
    },
  });
});

export default app;
