import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Clinic
  await prisma.clinic.upsert({
    where: { id: 'clinic-seed' },
    update: {},
    create: { id: 'clinic-seed', name: 'DentalFlow Clínica Demo' },
  });

  // 2. Create Professionals (Users)
  const drPerez = await prisma.user.upsert({
    where: { email: 'perez@dentalflow.com' },
    update: {},
    create: {
      email: 'perez@dentalflow.com',
      password: hashedPassword,
      name: 'Roberto',
      lastName: 'Pérez',
      role: 'ADMIN',
      professionalProfile: {
        create: { specialty: 'Odontología General', color: '#1D9E75' },
      },
    },
  });

  const draSosa = await prisma.user.upsert({
    where: { email: 'sosa@dentalflow.com' },
    update: {},
    create: {
      email: 'sosa@dentalflow.com',
      password: hashedPassword,
      name: 'María',
      lastName: 'Sosa',
      role: 'PROFESSIONAL',
      professionalProfile: {
        create: { specialty: 'Ortodoncia', color: '#185FA5' },
      },
    },
  });

  const drLuna = await prisma.user.upsert({
    where: { email: 'luna@dentalflow.com' },
    update: {},
    create: {
      email: 'luna@dentalflow.com',
      password: hashedPassword,
      name: 'Carlos',
      lastName: 'Luna',
      role: 'PROFESSIONAL',
      professionalProfile: {
        create: { specialty: 'Cirugía Maxilofacial', color: '#BA7517' },
      },
    },
  });

  // 3. Create Insurance Providers + Plans
  const osde = await prisma.insuranceProvider.create({
    data: {
      name: 'OSDE',
      plans: { create: [{ name: 'Plan 210' }, { name: 'Plan 310' }, { name: 'Plan 410' }] },
    },
    include: { plans: true },
  });

  const galeno = await prisma.insuranceProvider.create({
    data: {
      name: 'Galeno',
      plans: { create: [{ name: 'Plan Oro' }, { name: 'Plan Plata' }] },
    },
    include: { plans: true },
  });

  // 4. Create Patients
  const p1 = await prisma.patient.create({
    data: {
      name: 'Ana',
      lastName: 'García',
      dni: '35123456',
      dob: new Date('1990-05-15'),
      phone: '1122334455',
      email: 'ana.garcia@gmail.com',
      coverages: {
        create: { insurancePlanId: osde.plans[0].id, affiliateNumber: '1234567-0' },
      },
    },
  });

  const p2 = await prisma.patient.create({
    data: {
      name: 'Juan',
      lastName: 'Rodríguez',
      dni: '40123456',
      dob: new Date('1998-11-20'),
      phone: '1199887766',
      coverages: {
        create: { insurancePlanId: galeno.plans[0].id, affiliateNumber: '9988776' },
      },
    },
  });

  const p3 = await prisma.patient.create({
    data: {
      name: 'María',
      lastName: 'López',
      dni: '28998877',
      dob: new Date('1985-03-22'),
      phone: '1144556677',
      email: 'mlopez@hotmail.com',
    },
  });

  // 5. Create Appointments
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      date: today,
      duration: 30,
      status: 'CONFIRMED',
      practiceType: 'GENERAL_CONSULTATION',
      patientId: p1.id,
      professionalId: drPerez.id,
      notes: 'Control semestral.',
    },
  });

  const appt2Date = new Date(today);
  appt2Date.setHours(10, 30, 0, 0);
  await prisma.appointment.create({
    data: {
      date: appt2Date,
      duration: 60,
      status: 'PENDING',
      practiceType: 'EXTRACTION',
      patientId: p2.id,
      professionalId: drLuna.id,
      notes: 'Extracción molar inferior derecho.',
    },
  });

  const appt3Date = new Date(today);
  appt3Date.setHours(11, 15, 0, 0);
  await prisma.appointment.create({
    data: {
      date: appt3Date,
      duration: 45,
      status: 'CONFIRMED',
      practiceType: 'CLEANING',
      patientId: p3.id,
      professionalId: draSosa.id,
    },
  });

  console.log('✅ Seed completado correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
