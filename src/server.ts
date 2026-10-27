import { app } from './app.js';
import './jobs/index.js';
import { env } from './lib/env.js';

app.listen(env.port, () => {
  console.log(`Storefront API listening on port ${env.port}`);
});
