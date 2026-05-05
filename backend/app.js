const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '.env')});
const authRoutes = require('./routes/auth.routes');
const expenseCategoriesRoutes = require('./routes/category-expense.routes');
const incomeCategoriesRoutes = require('./routes/category-income.routes');
const operationsRoutes = require('./routes/operation.routes');
const balanceRoutes = require('./routes/balance.routes');

const allowedOrigins = ['https://lumincoin-finance-1.onrender.com', 'https://lumincoin-finance-vjzt.onrender.com'];

const app = express();

app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    }, credentials: true
}));

app.use("/api", authRoutes);
app.use("/api/categories/expense", expenseCategoriesRoutes);
app.use("/api/categories/income", incomeCategoriesRoutes);
app.use("/api/operations", operationsRoutes);
app.use("/api/balance", balanceRoutes);

// app.listen('3001', () => console.log(`Server started`));

const port = process.env.PORT || 3001;

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}

mongoose.connect(mongoUri, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => console.log(`Server started on port ${port}`))

}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
