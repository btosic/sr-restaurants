import { Request, Response } from 'express';
import nodemailer from "nodemailer";

export const sendEmail = async (mailDetails: any, callback: any) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const info = await transporter.sendMail(mailDetails)
    callback(info);
  } catch (error) {
    console.log(error);
  } 
}

export const sendVerificationEmail = async (req: Request, id: number, email: string, name: string, code: string, secret: string) => {
  const verificationUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.replace('register', 'verify')}?id=${id}&code=${code}`;
  const message = `Hello ${name}, nice to see you!\nPlease verify your account by clicking this URL: ${verificationUrl}\nRemember to add your 2FA secret to your authenticator app: ${secret}`;
  const options = {
      from: "SR Restaurants <sr.restaurants.1@gmail.com@gmail.com>",
      to: email,
      subject: "Verify your account at SR Restaurants",
      text: message
  }
  sendEmail(options, (info: any) => {
    console.log("Email sent successfully");
  });
}

export const sendWelcomeEmail = async (email: string, name: string, secret: string) => {
  const message = `Hello ${name}, you have successfully verified your account!\nRemember to add your 2FA secret to your authenticator app: ${secret} \nEnjoy our website!`;
  const options = {
      from: "SR Restaurants <sr.restaurants.1@gmail.com@gmail.com>",
      to: email,
      subject: "Welcome to SR Restaurants!",
      text: message
  }
  sendEmail(options, (info: any) => {
    console.log("Email sent successfully");
  });
}