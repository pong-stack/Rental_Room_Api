import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  validateImageFile(file: Express.Multer.File): boolean {
    // Check file type
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return false;
    }

    return true;
  }

  generateUniqueFileName(originalName: string): string {
    const fileExtension = extname(originalName);
    const uniqueId = uuidv4();
    return `${uniqueId}${fileExtension}`;
  }

  getImageUrl(fileName: string): string {
    // Return the full URL where the image can be accessed
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 6001}`;
    return `${baseUrl}/uploads/images/${fileName}`;
  }

  getAllowedImageTypes(): string[] {
    return this.allowedImageTypes;
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }
}
