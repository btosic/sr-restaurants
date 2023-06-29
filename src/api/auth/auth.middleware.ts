import { Request, Response, NextFunction } from 'express';
import { validate } from './../utils/jwt.utils';
import { TokenExpiredError } from 'jsonwebtoken';

export const authorize = (allowedRoutes: string[]) => async (req: any, res: Response, next: NextFunction) => {
  try {
    let jwt = req.headers.authorization;
    if (!jwt) {
      return res.status(401).end();
    }
    if (jwt.toLowerCase().startsWith('bearer')) {
      jwt = jwt.slice('bearer'.length).trim();
    }
    const decodedToken = validate(jwt);
    const hasAccessToEndpoint = allowedRoutes.some(route => decodedToken.routes.some(tokenRoute => tokenRoute === route));
    if (!hasAccessToEndpoint) {
      return res.status(405).end();
    }
    req.userEmail = decodedToken.email;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      const expiredExp = <TokenExpiredError>error;
      return res.status(401).json({ message: expiredExp.message }).end();
    }
    return res.status(500).json({ message: 'Authentication failed' }).end();
  }
};