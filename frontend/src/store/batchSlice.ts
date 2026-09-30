import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { batchService } from '../services/batch.service';
import type { Batch } from '../services/batch.service';
import api from '../services/api';

interface BatchState {
  batchList: Batch[];
  batches: Batch[];
  selectedBatch: Batch | null;
  loading: boolean;
  error: string | null;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

const initialState: BatchState = {
  batchList: [],
  batches: [],
  selectedBatch: null,
  loading: false,
  error: null,
  page: 0,
  size: 10,
  totalPages: 0,
  totalElements: 0,
};

export const getAllBatches = createAsyncThunk(
  'batch/getAllBatches',
  async (params: Record<string, any> | undefined, { rejectWithValue }) => {
    try {
      const res = await batchService.getAllBatches(params);
      const paginatedData = res.data;
      const batches = paginatedData.content || [];
      const batchesWithCount = batches.map((b: any) => ({
        ...b,
        studentCount: b.studentsCount || 0
      }));
      return {
        ...paginatedData,
        content: batchesWithCount
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch batches');
    }
  }
);

export const getPublicBatches = createAsyncThunk(
  'batch/getPublicBatches',
  async (_, { rejectWithValue }) => {
    try {
      const res = await batchService.getPublicBatches();
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch public batches');
    }
  }
);

export const getBatchById = createAsyncThunk(
  'batch/getBatchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await batchService.getBatchById(id);
      const b = res.data;
      try {
        const studentRes = await api.get(`/teacher/batches/${b.id}/students`);
        const students = studentRes.data.data || [];
        return { ...b, studentCount: students.length };
      } catch {
        return { ...b, studentCount: 0 };
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch batch');
    }
  }
);

export const createBatch = createAsyncThunk(
  'batch/createBatch',
  async (data: { batchName: string; description?: string }, { rejectWithValue }) => {
    try {
      const res = await batchService.createBatch(data);
      return { ...res.data, studentCount: 0 };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create batch');
    }
  }
);

export const updateBatch = createAsyncThunk(
  'batch/updateBatch',
  async (payload: { id: number; data: { batchName: string; description?: string } }, { rejectWithValue }) => {
    try {
      const res = await batchService.updateBatch(payload.id, payload.data);
      const b = res.data;
      try {
        const studentRes = await api.get(`/teacher/batches/${b.id}/students`);
        const students = studentRes.data.data || [];
        return { ...b, studentCount: students.length };
      } catch {
        return { ...b, studentCount: 0 };
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update batch');
    }
  }
);

export const deleteBatch = createAsyncThunk(
  'batch/deleteBatch',
  async (id: number, { rejectWithValue }) => {
    try {
      await batchService.deleteBatch(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete batch');
    }
  }
);

const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    clearSelectedBatch: (state) => {
      state.selectedBatch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllBatches
      .addCase(getAllBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBatches.fulfilled, (state, action: any) => {
        state.loading = false;
        state.batches = action.payload.content || [];
        state.batchList = action.payload.content || [];
        state.page = action.payload.page || 0;
        state.size = action.payload.size || 10;
        state.totalPages = action.payload.totalPages || 0;
        state.totalElements = action.payload.totalElements || 0;
      })
      .addCase(getAllBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // getPublicBatches
      .addCase(getPublicBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicBatches.fulfilled, (state, action: PayloadAction<Batch[]>) => {
        state.loading = false;
        state.batches = action.payload;
        state.batchList = action.payload;
      })
      .addCase(getPublicBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // getBatchById
      .addCase(getBatchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBatchById.fulfilled, (state, action: PayloadAction<Batch>) => {
        state.loading = false;
        state.selectedBatch = action.payload;
      })
      .addCase(getBatchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createBatch
      .addCase(createBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBatch.fulfilled, (state, action: PayloadAction<Batch>) => {
        state.loading = false;
        state.batches.push(action.payload);
        state.batchList.push(action.payload);
      })
      .addCase(createBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateBatch
      .addCase(updateBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBatch.fulfilled, (state, action: PayloadAction<Batch>) => {
        state.loading = false;
        const index = state.batches.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.batches[index] = action.payload;
          state.batchList[index] = action.payload;
        }
        if (state.selectedBatch && state.selectedBatch.id === action.payload.id) {
          state.selectedBatch = action.payload;
        }
      })
      .addCase(updateBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // deleteBatch
      .addCase(deleteBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBatch.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.batches = state.batches.filter((b) => b.id !== action.payload);
        state.batchList = state.batchList.filter((b) => b.id !== action.payload);
        if (state.selectedBatch && state.selectedBatch.id === action.payload) {
          state.selectedBatch = null;
        }
      })
      .addCase(deleteBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedBatch } = batchSlice.actions;
export default batchSlice.reducer;
