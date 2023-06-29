import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'

export const reset = async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  await prisma.customer.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.$disconnect();
  res.send({ success: true });
};