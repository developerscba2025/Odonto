import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-key-dentalflow';

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        color: user.color
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor durante el login' });
  }
};

export const getMe = async (req: any, res: Response): Promise<any> => {
   try {
     const user = await prisma.user.findUnique({
       where: { id: req.user.id }
     });
     
     if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

     res.json({
       id: user.id,
       name: user.name,
       email: user.email,
       role: user.role,
       color: user.color
     });
   } catch (error) {
     res.status(500).json({ error: 'Error al obtener perfil' });
   }
};

export const getProfessionals = async (req: Request, res: Response): Promise<any> => {
  try {
    const professionals = await prisma.user.findMany({
      where: {
        role: { in: ['DENTIST', 'ADMIN'] }
      },
      select: { id: true, name: true, email: true, role: true, color: true }
    });
    res.json(professionals);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener profesionales' });
  }
};

export const updateProfile = async (req: any, res: Response): Promise<any> => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

export const createProfessional = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role, color } = req.body;
    const passwordHash = await bcrypt.hash(password || '123456', 10);
    
    const newProfessional = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'DENTIST',
        color: color || '#3b82f6'
      }
    });

    res.status(201).json(newProfessional);
  } catch (error) {
    console.error('Error creating professional:', error);
    res.status(500).json({ error: 'Error al crear el profesional' });
  }
};

export const updateProfessional = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, email, role, color } = req.body;
    
    const updated = await prisma.user.update({
      where: { id },
      data: { name, email, role, color }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el profesional' });
  }
};
