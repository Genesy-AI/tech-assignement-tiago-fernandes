import express, { NextFunction, Request, Response } from 'express'

export const jsonValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Request body is required and must be valid JSON' })
  }
  next()
}
