import { Request, Response } from 'express';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/mail.utils';
import { generateMfaTotp, validateMfaToken } from '../utils/mfa.utils';
import { Prisma, PrismaClient } from '@prisma/client'
import { IRegisterRequest, ILoginRequest } from './customers.model';
import crypto from 'crypto';
import { createHash, validatePassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';

export const register = async (req: IRegisterRequest, res: Response) => {
  const prisma = new PrismaClient();
  try {
    const { email, password, name, address } = req.body;
    const code = crypto.randomUUID();
    const totp = generateMfaTotp();
    const passwordHash = await createHash(password);
    const data = {
      Email: email,
      Name: name,
      Address: address,
      PasswordHash: passwordHash,
      VerificationCode: code,
      MfaSecret: totp.secret.base32
    };
    const customer = await prisma.customer.create({ data });

    await sendVerificationEmail(req, customer.Id, customer.Email, customer.Name, customer.VerificationCode, customer.MfaSecret);
    await prisma.$disconnect();
    res.send({
      email: customer.Email,
      mfaSecret: customer.MfaSecret,
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
  const customer = await prisma.customer.findFirst({    
    where: {
      Id: id,
      VerificationCode: code
    }
  });
  if (customer) {
    if (customer.Verified) {
      res.send(`You are already verified.`);
    } else {
      const customer = await prisma.customer.update({
        where: { Id: id },
        data: { Verified: true }
      });
      sendWelcomeEmail(customer.Email, customer.Name, customer.MfaSecret);
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
  const customer = await prisma.customer.findUnique({
    where: {
      Email: email
    }
  });
  await prisma.$disconnect();

  // Does user exist?
  if (!customer) {
    return res.status(404).send("User does not exist");
  }
  // Is user verified?
  if (!customer.Verified) {
    return res.status(403).send("User is not verified yet");
  }
  // Is password correct?
  const passwordCorrect = await validatePassword(password, customer.PasswordHash);
  if (!passwordCorrect) {
    return res.status(403).send(credentialsError);
  }
  // Is token correct?
  if (!validateMfaToken(customer.MfaSecret, mfaToken)) {
    return res.status(403).send(credentialsError);
  }
  res.send({
    jwtToken: generateToken(customer.Id, customer.Email)
  });
};

export const profile = async (req: any, res: Response) => {
  const { userEmail } = req;
  const prisma = new PrismaClient();
  const customer = await prisma.customer.findUnique({
    where: {
      Email: userEmail
    }
  });
  await prisma.$disconnect();

  // Does user exist?
  if (!customer) {
    return res.status(404).send("User does not exist");
  }
  res.send({
    id: customer.Id,
    email: customer.Email,
    name: customer.Name,
    address: customer.Address,
    mfaSecret: customer.MfaSecret
  });
};