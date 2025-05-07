const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const onsiteTaskRoutes = require('./routes/onsiteTaskRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', onsiteTaskRoutes);

// ... rest of the existing code ... 