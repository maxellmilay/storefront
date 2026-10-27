import express from 'express';
import { optionalAuth, requireAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { requireRole } from './middleware/requireRole.js';
import accountRouter from './routes/account.routes.js';
import adminRouter from './routes/admin.routes.js';
import authRouter from './routes/auth.routes.js';
import cartRouter from './routes/cart.routes.js';
import categoriesRouter from './routes/categories.routes.js';
import ordersRouter from './routes/orders.routes.js';
import productsRouter from './routes/products.routes.js';
import webhooksRouter from './routes/webhooks.routes.js';

export const app = express();

app.use(requestId);

// Webhooks are signed over the exact bytes received, so they are mounted
// before the JSON parser and read the raw body themselves.
app.use('/webhooks', webhooksRouter);

app.use(express.json({ limit: '100kb' }));

app.use('/auth', authRouter);
app.use('/products', optionalAuth, productsRouter);
app.use('/categories', categoriesRouter);
app.use('/account', requireAuth, accountRouter);
app.use('/cart', requireAuth, cartRouter);
app.use('/orders', requireAuth, ordersRouter);
app.use('/admin', requireAuth, requireRole('ADMIN'), adminRouter);

app.use(errorHandler);
