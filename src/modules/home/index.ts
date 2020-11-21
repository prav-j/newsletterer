import { Request, Response } from "express";

export const index = (_req: Request, res: Response) => {
  res.send({
    title: `Home - ${process.env.NODE_ENV}`
  });
};

