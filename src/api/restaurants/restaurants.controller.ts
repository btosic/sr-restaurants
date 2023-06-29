import { Request, Response } from 'express';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/mail.utils';
import { generateMfaTotp, validateMfaToken } from '../utils/mfa.utils';
import { Prisma, PrismaClient } from '@prisma/client'
import { IRegisterRequest, ILoginRequest } from './restaurants.model';
import crypto from 'crypto';
import { createHash, validatePassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';

export const register = async (req: IRegisterRequest, res: Response) => {
  const prisma = new PrismaClient();
  try {
    const { email, password, name, address, locationX, locationY } = req.body;
    const code = crypto.randomUUID();
    const totp = generateMfaTotp();
    const passwordHash = await createHash(password);
    const data = {
      Email: email,
      Name: name,
      Address: address,
      LocationX: locationX,
      LocationY: locationY,
      PasswordHash: passwordHash,
      VerificationCode: code,
      MfaSecret: totp.secret.base32
    };
    const restaurant = await prisma.restaurant.create({ data });

    await sendVerificationEmail(req, restaurant.Id, restaurant.Email, restaurant.Name, restaurant.VerificationCode, restaurant.MfaSecret);
    await prisma.$disconnect();
    res.send({
      email: restaurant.Email,
      mfaSecret: restaurant.MfaSecret,
      mfaUrl: totp.toString()
    });
  }
  catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).send("Email already exist, please use another email address");
      }
    }
    res.status(400).send(error.message);
  }
  prisma.$disconnect();
};

export const verify = async (req: Request, res: Response) => {
  const id = Number(req.query.id);  
  const code = req.query.code?.toString();
  const prisma = new PrismaClient();
  const restaurant = await prisma.restaurant.findFirst({    
    where: {
      Id: id,
      VerificationCode: code
    }
  });
  if (restaurant) {
    if (restaurant.Verified) {
      res.send(`You are already verified.`);
    } else {
      const restaurant = await prisma.restaurant.update({
        where: { Id: id },
        data: { Verified: true }
      });
      sendWelcomeEmail(restaurant.Email, restaurant.Name, restaurant.MfaSecret);
      res.send(`Verification successful!`);
    }
  } else {
    res.statusCode = 400;
    res.send(`Invalid verification code`);
  }
  prisma.$disconnect();
};

export const login = async (req: ILoginRequest, res: Response) => {
  const { email, password, mfaToken } = req.body;
  const credentialsError = "Incorrect password or token";
  if (!email || !mfaToken || !password) {
    return res.status(403).send(credentialsError);
  }

  const prisma = new PrismaClient();
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      Email: email
    }
  });
  await prisma.$disconnect();

  // Does user exist?
  if (!restaurant) {
    return res.status(404).send("User does not exist");
  }
  // Is user verified?
  if (!restaurant.Verified) {
    return res.status(403).send("User is not verified yet");
  }
  // Is password correct?
  const passwordCorrect = await validatePassword(password, restaurant.PasswordHash);
  if (!passwordCorrect) {
    return res.status(403).send(credentialsError);
  }
  // Is token correct?
  if (!validateMfaToken(restaurant.MfaSecret, mfaToken)) {
    return res.status(403).send(credentialsError);
  }
  res.send({
    jwtToken: generateToken(restaurant.Id, restaurant.Email)
  });
};

export const profile = async (req: any, res: Response) => {
  const { userEmail } = req;
  const prisma = new PrismaClient();
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      Email: userEmail
    }
  });
  await prisma.$disconnect();

  // Does user exist?
  if (!restaurant) {
    return res.status(404).send("User does not exist");
  }
  res.send({
    id: restaurant.Id,
    email: restaurant.Email,
    name: restaurant.Name,
    locationX: restaurant.LocationX,
    locationY: restaurant.LocationY,
    address: restaurant.Address,
    mfaSecret: restaurant.MfaSecret
  });
};