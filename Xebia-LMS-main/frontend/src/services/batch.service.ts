import api from './api';

export interface Batch {
  id: number;
  batchName: string;
  description?: string;
  studentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchRequestData {
  batchName: string;
  description?: string;
}

export const batchService = {
  getAllBatches: async (params?: Record<string, any>) => {
    const res = await api.get('/teacher/batches', { params });
    return res.data;
  },

  getBatchById: async (id: number) => {
    const res = await api.get(`/teacher/batches/${id}`);
    return res.data; // Should return { success: true, data: Batch }
  },

  createBatch: async (data: BatchRequestData) => {
    const res = await api.post('/teacher/batches', data);
    return res.data; // Should return { success: true, data: Batch }
  },

  updateBatch: async (id: number, data: BatchRequestData) => {
    const res = await api.put(`/teacher/batches/${id}`, data);
    return res.data; // Should return { success: true, data: Batch }
  },

  deleteBatch: async (id: number) => {
    const res = await api.delete(`/teacher/batches/${id}`);
    return res.data; // Should return { success: true, data: null }
  },

  getPublicBatches: async () => {
    const res = await api.get('/auth/batches');
    return res.data;
  },
};
