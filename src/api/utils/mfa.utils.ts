import crypto from 'crypto';
import { encode } from "hi-base32";
import otpauth from "otpauth";

const OTP_LABEL = "SR Restaurants";

export const generateMfaTotp = () => {
  // Generate buffer and convert it to secret key
  const buffer = crypto.randomBytes(15);
  const secret = encode(buffer).replace(/=/g, "").substring(0, 24);
  // Label the secret as SR Restaurants
  return new otpauth.TOTP({
    label: OTP_LABEL,
    secret: secret
  });
};

export const validateMfaToken = (secret: string, token: string) => {
  let totp = new otpauth.TOTP({
    label: OTP_LABEL,
    secret: secret
  });
  let delta = totp.validate({ token, window: 1 });
  return (delta !== null);
};
