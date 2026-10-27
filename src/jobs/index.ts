import cron from 'node-cron';
import { cancelUnpaidOrders } from './cancelUnpaidOrders.js';
import './emailWorker.js';
import { pruneAbandonedCarts } from './pruneAbandonedCarts.js';

// Every 15 minutes.
cron.schedule('*/15 * * * *', cancelUnpaidOrders);

// Every day at 03:00 server time.
cron.schedule('0 3 * * *', pruneAbandonedCarts);
