import { sign, SignOptions, verify, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

export const generateToken = (id: number, email: string) => {
  const payload = {
    id,
    email,
    routes: [
      'getProfile',
      'getMenu'
    ]
  };
  const privateKey = fs.readFileSync(path.join(__dirname, './../../../private.key'));
  const signInOptions: SignOptions = {
    algorithm: 'RS256',
    expiresIn: '1h'
  };  
  return sign(payload, privateKey, signInOptions);
};

interface TokenPayload extends JwtPayload {
  exp: number;
  routes: string[];
  name: string;
  userId: number;
}

export const validate = (token: string): TokenPayload => {
  const key = fs.readFileSync(path.join(__dirname, './../../../public.key'));
  const pptions: VerifyOptions = {
    algorithms: ['RS256'],
  };
  try {
    let decoded = <TokenPayload>verify(token, key);
    return decoded;
  } catch(err) {
    throw err;    
  }
}