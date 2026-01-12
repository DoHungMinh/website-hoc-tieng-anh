import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import fs from 'fs';
import path from 'path';

/**
 * Cloudinary Upload Service
 * Upload audio files to Cloudinary cloud storage
 */
export class CloudinaryService {
  
  /**
   * Upload audio file to Cloudinary
   * @param filePath - Local file path
   * @param options - Upload options
   * @returns Cloudinary URL
   */
  async uploadAudio(
    filePath: string,
    options?: {
      folder?: string;
      publicId?: string;
      userId?: string;
      sessionId?: string;
    }
  ): Promise<{
    url: string;
    secureUrl: string;
    publicId: string;
    format: string;
    duration: number;
    bytes: number;
  }> {
    try {
      // Check if Cloudinary is configured
      if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary is not configured. Please set CLOUDINARY_* environment variables.');
      }

      // Validate file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Default options
      const folder = options?.folder || 'voice-chat';
      const publicId = options?.publicId || `audio-${Date.now()}`;
      const userId = options?.userId || 'unknown';
      const sessionId = options?.sessionId || 'unknown';

      console.log('☁️ Uploading to Cloudinary:', {
        filePath,
        folder,
        publicId,
      });

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video', // Audio files use 'video' resource type
        folder: `${folder}/${userId}`,
        public_id: publicId,
        overwrite: true,
        // Add custom metadata
        context: {
          userId,
          sessionId,
          uploadedAt: new Date().toISOString(),
        },
        // Audio-specific options
        format: 'mp3', // Convert to MP3 for consistency
      });

      console.log('✅ Cloudinary upload successful:', {
        url: result.secure_url,
        bytes: result.bytes,
        duration: result.duration,
      });

      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        duration: result.duration || 0,
        bytes: result.bytes,
      };

    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw error;
    }
  }

  /**
   * Delete audio from Cloudinary
   * @param publicId - Cloudinary public ID
   */
  async deleteAudio(publicId: string): Promise<void> {
    try {
      if (!isCloudinaryConfigured()) {
        console.warn('⚠️ Cloudinary not configured, skipping delete');
        return;
      }

      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video',
      });

      console.log('🗑️ Deleted from Cloudinary:', publicId);
    } catch (error) {
      console.error('❌ Cloudinary delete error:', error);
      // Don't throw - deletion failure shouldn't break the flow
    }
  }

  /**
   * Get audio info from Cloudinary
   * @param publicId - Cloudinary public ID
   */
  async getAudioInfo(publicId: string): Promise<any> {
    try {
      if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary not configured');
      }

      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'video',
      });

      return result;
    } catch (error) {
      console.error('❌ Get audio info error:', error);
      throw error;
    }
  }

  /**
   * Cleanup old audio files from Cloudinary
   * @param folder - Folder to cleanup
   * @param olderThanDays - Delete files older than N days
   */
  async cleanupOldFiles(folder: string, olderThanDays: number = 30): Promise<number> {
    try {
      if (!isCloudinaryConfigured()) {
        console.warn('⚠️ Cloudinary not configured, skipping cleanup');
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      console.log(`🧹 Cleaning up Cloudinary files older than ${olderThanDays} days in folder: ${folder}`);

      // List resources in folder
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'video',
        prefix: folder,
        max_results: 500,
      });

      let deletedCount = 0;

      for (const resource of result.resources) {
        const createdAt = new Date(resource.created_at);
        
        if (createdAt < cutoffDate) {
          await this.deleteAudio(resource.public_id);
          deletedCount++;
        }
      }

      console.log(`✅ Cleaned up ${deletedCount} old audio files from Cloudinary`);
      return deletedCount;

    } catch (error) {
      console.error('❌ Cleanup error:', error);
      return 0;
    }
  }

  /**
   * Check if Cloudinary is available
   */
  isAvailable(): boolean {
    return isCloudinaryConfigured();
  }
}

export const cloudinaryService = new CloudinaryService();
