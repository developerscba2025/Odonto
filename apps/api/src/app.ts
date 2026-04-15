import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import insuranceRoutes from './routes/insurance.routes.js';
import absenceRoutes from './routes/absence.routes.js';
import clinicalRoutes from './routes/clinical.routes.js';

const app: Express = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/insurances', insuranceRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/clinical', clinicalRoutes);
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`🦷 DentalFlow API running on port ${PORT}`));

export default app;
