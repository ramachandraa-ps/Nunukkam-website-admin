import api from './api';
import {
  ApiResponse,
  UploadResult,
  PresignedUploadRequest,
  PresignedUploadResponse,
  UploadCategory,
  FileType,
} from '../types/reports';

const UPLOAD_ENDPOINTS = {
  FILE: '/api/uploads/file',
  FILES: '/api/uploads/files',
  PRESIGNED: '/api/uploads/presigned-upload',
  DELETE: '/api/uploads',
};

export const uploadService = {
  /**
   * Upload single file
   * POST /api/uploads/file
   * Access: Auth User
   */
  uploadFile: async (
    file: File,
    category: UploadCategory,
    fileType?: FileType,
    subFolder?: string
  ): Promise<ApiResponse<{ file: UploadResult }>> => {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('category', category);
    if (fileType) params.append('fileType', fileType);
    if (subFolder) params.append('subFolder', subFolder);

    const response = await api.post<ApiResponse<{ file: UploadResult }>>(
      `${UPLOAD_ENDPOINTS.FILE}?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload multiple files
   * POST /api/uploads/files
   * Access: Auth User
   */
  uploadMultipleFiles: async (
    files: File[],
    category: UploadCategory,
    fileType?: FileType,
    subFolder?: string
  ): Promise<ApiResponse<{ files: UploadResult[] }>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const params = new URLSearchParams();
    params.append('category', category);
    if (fileType) params.append('fileType', fileType);
    if (subFolder) params.append('subFolder', subFolder);

    const response = await api.post<ApiResponse<{ files: UploadResult[] }>>(
      `${UPLOAD_ENDPOINTS.FILES}?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get presigned URL for direct S3 upload
   * POST /api/uploads/presigned-upload
   * Access: Auth User
   */
  getPresignedUploadUrl: async (data: PresignedUploadRequest): Promise<ApiResponse<PresignedUploadResponse>> => {
    const response = await api.post<ApiResponse<PresignedUploadResponse>>(
      UPLOAD_ENDPOINTS.PRESIGNED,
      data
    );
    return response.data;
  },

  /**
   * Delete file from S3
   * DELETE /api/uploads
   * Access: ADMIN
   */
  deleteFile: async (key: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      UPLOAD_ENDPOINTS.DELETE,
      { data: { key } }
    );
    return response.data;
  },

  /**
   * Upload file using presigned URL (direct to S3)
   * This is a helper function that combines getting presigned URL and uploading
   */
  uploadWithPresignedUrl: async (
    file: File,
    category: UploadCategory,
    fileType?: FileType
  ): Promise<{ key: string; url: string }> => {
    // Get presigned URL
    const presignedResponse = await uploadService.getPresignedUploadUrl({
      fileName: file.name,
      mimeType: file.type,
      category,
      fileType,
    });

    if (!presignedResponse.success || !presignedResponse.data) {
      throw new Error('Failed to get presigned URL');
    }

    const { uploadUrl, key } = presignedResponse.data;

    // Upload directly to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // Construct the public URL
    const url = uploadUrl.split('?')[0];

    return { key, url };
  },
};

export default uploadService;
