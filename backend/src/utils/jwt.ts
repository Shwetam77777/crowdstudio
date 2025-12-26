
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface TokenPayload {
  userId: number;
  role: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign({ ...payload }, config.jwt.secret, {
    expiresIn: config.jwt.expiry as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};
