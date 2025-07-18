import prisma from '../utils/prisma';
import { Request, Response } from 'express';

export const getProfile = async (req: Request, res: Response) => {
  try { 
    const user = await prisma.user.findFirst({
      where: { id: req.user?.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error getting profile',
      error: error.message,
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};
