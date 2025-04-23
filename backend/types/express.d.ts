// types/express.d.ts

declare namespace Express {
  interface Request {
    files?: {
      image?: Express.Multer.File[];
      file?: Express.Multer.File[];
    };
  }
}
