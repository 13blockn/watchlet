const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
require('./db');
require('./db/seed');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Watch Academy API running on http://localhost:${PORT}`);
});
