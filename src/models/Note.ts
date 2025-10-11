// src/models/Note.ts

import { ApiStatus } from '../enums/ApiEnums';
import { 
  NoteType, 
  NoteColor, 
  NoteCategory, 
  NotePriority, 
  NoteStatus,
  NoteViewMode,
  NoteSortBy,
  NoteSortOrder
} from '../enums/NoteEnums';

// Note interface matching API specification
export interface Note {
  userNoteId: number;
  userId: number;
  noteTitle: string;
  noteContent: string;
  noteType: NoteType;
  color: NoteColor;
  category: NoteCategory;
  priority: NotePriority;
  status: NoteStatus;
  isPinned: boolean;
  isShared: boolean;
  reminderDate?: string;
  version: number;
  accessCount: number;
  lastAccessedDate?: string;
  createdDate: string;
  modifiedDate: string;
}

// Form Data interface for creating/updating notes (matches API request body)
export interface NoteFormData {
  noteTitle: string;
  noteContent: string;
  noteType: NoteType;
  color: NoteColor;
  category: NoteCategory;
  priority: NotePriority;
  status?: NoteStatus;
  isPinned?: boolean;
  isShared?: boolean;
  reminderDate?: string;
}

export interface NoteUpdateData extends Partial<NoteFormData> {
  userNoteId: number;
}

// Quick Note for fast creation
export interface QuickNoteData {
  title: string;
  content: string;
  type?: NoteType;
  color?: NoteColor;
  category?: NoteCategory;
  priority?: NotePriority;
}

// Simplified Filter interface
export interface NoteFilterParams {
  noteType?: NoteType[];
  color?: NoteColor[];
  category?: NoteCategory[];
  priority?: NotePriority[];
  status?: NoteStatus[];
  isPinned?: boolean;
  isShared?: boolean;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  sortBy?: NoteSortBy;
  sortOrder?: NoteSortOrder;
  page?: number;
  limit?: number;
}

// Simplified Search interface
export interface NoteSearchParams {
  query: string;
  filters?: NoteFilterParams;
}

// Bulk Operations matching API specification
export interface BulkNoteUpdateData {
  noteIds: number[];
  status?: NoteStatus;
  color?: NoteColor;
  category?: NoteCategory;
  priority?: NotePriority;
  isPinned?: boolean;
  isShared?: boolean;
}

export interface BulkNoteDeleteData {
  noteIds: number[];
  permanentDelete?: boolean;
}

export interface BulkNoteResponse {
  status: ApiStatus;
  message: string;
  data: {
    updatedCount: number;
    failedCount: number;
  };
}

// Statistics interface matching API specification
export interface NoteStatsResponse {
  totalNotes: number;
  activeNotes: number;
  archivedNotes: number;
  pinnedNotes: number;
  notesByCategory: Record<string, number>;
  notesByPriority: Record<string, number>;
  notesByType: Record<string, number>;
}

// API Response interfaces
export interface NoteResponse {
  status: ApiStatus;
  message: string;
  data: Note | undefined;
}

export interface NoteListResponse {
  status: ApiStatus;
  message: string;
  data: {
    notes: Note[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NoteCreateResponse {
  status: ApiStatus;
  message: string;
  data: Note | undefined;
}

export interface NoteStatsApiResponse {
  status: ApiStatus;
  message: string;
  data: NoteStatsResponse | undefined;
}

// UI State interface
export interface NoteUIState {
  viewMode: NoteViewMode;
  sortBy: NoteSortBy;
  sortOrder: NoteSortOrder;
  activeFilters: NoteFilterParams;
  selectedNotes: number[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}