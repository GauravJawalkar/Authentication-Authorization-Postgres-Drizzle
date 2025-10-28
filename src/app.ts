import express from 'express';

const app = express();
const PORT = process.env.PORT!;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))

//middleware
app.use(express.json());

// Specific controller imports
import authController from './routes/auth.route'

app.use('/api/v1/auth', authController);




