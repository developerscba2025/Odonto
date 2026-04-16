import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import clinicalRoutes from './routes/clinicalRoutes';
import mediaRoutes from './routes/mediaRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { notificationService } from './services/notificationService';
import { whatsappService } from './services/whatsappService';
import { authenticateJWT } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej: curl, Postman en dev)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origen no permitido — ${origin}`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);

// WhatsApp Routes
app.get('/api/whatsapp/status', authenticateJWT, (req, res) => {
  res.json(whatsappService.getStatus());
});

app.post('/api/whatsapp/logout', authenticateJWT, async (req, res) => {
  await whatsappService.logout();
  res.json({ success: true, message: 'Sesión de WhatsApp cerrada' });
});

// API Healtcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DentalFlow API is running perfectly' });
});

app.listen(PORT, () => {
  console.log(`DentalFlow Server is running on http://localhost:${PORT}`);
  // Iniciar tareas programadas (WhatsApp recordatorios)
  notificationService.initScheduledTasks();
  // Inicializar WhatsApp Web
  whatsappService.init();
});

// Global error handler — debe ir al final de todos los middlewares
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[DentalFlow Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  });
});

