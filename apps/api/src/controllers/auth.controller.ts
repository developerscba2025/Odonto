import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, lastName, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        lastName,
        email,
        password: hashedPassword,
        role: 'PROFESSIONAL',
        professionalProfile: {
          create: {
            color: '#1D9E75', // Default teal
          },
        },
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        role: true,
        professionalProfile: true,
      },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

export const getProfessionals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const professionals = await prisma.user.findMany({
      where: {
        professionalProfile: { isNot: null }
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        role: true,
        professionalProfile: true,
      },
    });
    res.json(professionals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener profesionales' });
  }
};
