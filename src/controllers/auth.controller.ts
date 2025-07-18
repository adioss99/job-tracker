import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { loginValidationSchema, userValidationSchema } from '../validations/user.validation';
import { valResponse } from '../helper/validation.helper';
import { Prisma } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/bcrypts';
import { generateRefreshToken, generateToken, verifyRefreshToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = userValidationSchema(req.body);
    if (error) return valResponse(res, error);

    const { name, email, password } = value;
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: await hashPassword(password) },
    });
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error: string | any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating users',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginValidationSchema(req.body);
    if (error) return valResponse(res, error);

    const { email, password } = value;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, role: true },
    });
    if (!user) return invalidResponse(res, '2');

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return invalidResponse(res);

    const accessToken: string = generateToken({ id: user.id, name: user.name, role: user.role });
    const refreshToken: string = generateRefreshToken({ id: user.id, name: user.name, role: user.role });

    const data = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
      select: { id: true, name: true, email: true, role: true },
    });

    res
      .status(200)
      .cookie('refresh', refreshToken, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 })
      .json({
        success: true,
        data: { data, accessToken },
      });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refresh) return res.status(401).json({ success: false, message: 'No refresh token provided' });
    console.log(!cookies?.refresh); 

    const token = cookies.refresh;
    const user = await prisma.user.findFirst({
      where: { refreshToken: token },
    });
    if (!user) return invalidResponse(res, '3');

    const verifyToken = verifyRefreshToken(token);
    if (!verifyToken) return res.status(403);

    const accessToken = generateToken({ id: user.id, name: user.name, role: user.role });

    res.status(200).json({ accessToken });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: error.message,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refresh;
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    await prisma.user.update({
      where: { id: req.user?.id },
      data: { refreshToken: '' },
    });

    res.status(200).clearCookie('refresh').json({ success: true, message: 'Logged out successfully' });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message,
    });
  }
};

const invalidResponse = (res: Response, val: string = '', code: number = 401) => {
  return res.status(401).json({
    success: false,
    message: 'Invalid credentials ' + val,
  });
};
