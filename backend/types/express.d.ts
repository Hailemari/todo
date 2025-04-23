// types/express.d.ts
import multer from 'multer';

declare global {
  namespace Express {
    // Properly define the Multer namespace
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }

    // Extend the Request interface
    interface Request {
      user?: any;
      files?: {
        [fieldname: string]: Express.Multer.File[];
      };
    }
  }
}

// This is needed to make the file a module
export {};