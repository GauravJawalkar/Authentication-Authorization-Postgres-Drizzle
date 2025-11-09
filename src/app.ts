import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT!;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
const allowedOrigins = [
    'http://localhost:3000'
]

import cookieParser from 'cookie-parser';
// Middlewares
app.use(express.json());
app.use(cookieParser())
// production middleware for CORS policy : allow permission for cross origin requests
app.use(cors({
    origin: allowedOrigins
}))

// Specific controller imports
import authRouter from './routes/auth.route'
import userRouter from './routes/user.route'

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter)