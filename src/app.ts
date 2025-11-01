import express from 'express';

const app = express();
const PORT = process.env.PORT!;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))

// Middlewares
app.use(express.json());

// Specific controller imports
import authRouter from './routes/auth.route'
import userRouter from './routes/user.route'

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter)




