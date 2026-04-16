import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import clinicalRoutes from './routes/clinicalRoutes';
import mediaRoutes from './routes/mediaRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/media', mediaRoutes);

// API Healtcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DentalFlow API is running perfectly' });
});

app.listen(PORT, () => {
  console.log(`DentalFlow Server is running on http://localhost:${PORT}`);
});
