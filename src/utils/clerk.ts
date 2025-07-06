import { getAuth } from "@clerk/express";
import { Request, Response } from "express";

export const hasPermission = (request: Request, response: Response) => {
  const auth = getAuth(request);

  if (!auth.userId) {
    return response.status(401).send('User ID not found');
  }

  return auth.userId;
};