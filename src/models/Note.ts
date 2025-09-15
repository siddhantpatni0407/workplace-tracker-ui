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

// Base Note interface
export interface BaseNote {
  noteId: number;
  userId: number;
  noteTitle: string;
  noteContent: string;
  noteType: NoteType;
  color: NoteColor;
  category: NoteCategory;
  priority: NotePriority;
  status: NoteStatus;
  tags: string[];
  isPinned: boolean;
  isShared: boolean;
  createdDate: string;
  modifiedDate: string;
  reminderDate?: string;
  attachments?: NoteAttachment[];
  metadata?: NoteMetadata;
}

// Full Note interface with additional properties
export interface Note extends BaseNote {
  sharedWith?: SharedUser[];
  collaborators?: NoteCollaborator[];
  version: number;
  parentNoteId?: number;
  childNotes?: Note[];
  checklistItems?: ChecklistItem[];
  drawing?: DrawingData;
  voiceNote?: VoiceNoteData;
  linkData?: LinkData;
  location?: NoteLocation;
  lastAccessedDate?: string;
  accessCount: number;
}

// Note Attachment interface
export interface NoteAttachment {
  attachmentId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadDate: string;
  thumbnailPath?: string;
}

// Note Metadata interface
export interface NoteMetadata {
  wordCount: number;
  characterCount: number;
  estimatedReadTime: number;
  language?: string;
  source?: string;
  templates?: string[];
  customFields?: Record<string, any>;
}

// Shared User interface
export interface SharedUser {
  userId: number;
  userName: string;
  userEmail: string;
  permission: 'READ' | 'WRITE' | 'ADMIN';
  sharedDate: string;
}

// Note Collaborator interface
export interface NoteCollaborator {
  userId: number;
  userName: string;
  lastEditDate: string;
  editCount: number;
  isOnline: boolean;
}

// Checklist Item interface
export interface ChecklistItem {
  itemId: number;
  text: string;
  isCompleted: boolean;
  order: number;
  createdDate: string;
  completedDate?: string;
  subItems?: ChecklistItem[];
}

// Drawing Data interface
export interface DrawingData {
  canvasData: string; // Base64 encoded canvas data
  strokes: DrawingStroke[];
  dimensions: {
    width: number;
    height: number;
  };
  tools: DrawingTool[];
}

// Drawing Stroke interface
export interface DrawingStroke {
  strokeId: string;
  tool: string;
  color: string;
  width: number;
  points: Point[];
  timestamp: string;
}

// Drawing Tool interface
export interface DrawingTool {
  name: string;
  color: string;
  width: number;
  opacity: number;
}

// Point interface for drawing
export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

// Voice Note Data interface
export interface VoiceNoteData {
  audioFile: string; // File path or URL
  duration: number; // in seconds
  transcript?: string;
  transcriptLanguage?: string;
  waveformData?: number[];
  isTranscribed: boolean;
}

// Link Data interface
export interface LinkData {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
  preview?: string;
  domain: string;
  isValidLink: boolean;
  lastChecked: string;
}

// Note Location interface
export interface NoteLocation {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
  accuracy?: number;
  timestamp: string;
}

// Form Data interfaces
export interface NoteFormData {
  noteTitle: string;
  noteContent: string;
  noteType: NoteType;
  color: NoteColor;
  category: NoteCategory;
  priority: NotePriority;
  tags: string[];
  reminderDate?: string;
  checklistItems?: Omit<ChecklistItem, 'itemId' | 'createdDate'>[];
  drawingData?: Omit<DrawingData, 'strokes'>;
  linkUrl?: string;
  attachments?: File[];
  metadata?: Partial<NoteMetadata>;
}

export interface NoteUpdateData extends Partial<NoteFormData> {
  noteId: number;
  modifiedDate?: string;
}

export interface QuickNoteData {
  title: string;
  content: string;
  type?: NoteType;
  color?: NoteColor;
  category?: NoteCategory;
  priority?: NotePriority;
}

// Filter and Search interfaces
export interface NoteFilterParams {
  noteType?: NoteType[];
  color?: NoteColor[];
  category?: NoteCategory[];
  priority?: NotePriority[];
  status?: NoteStatus[];
  isPinned?: boolean;
  hasReminder?: boolean;
  hasAttachments?: boolean;
  isShared?: boolean;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  sortBy?: NoteSortBy;
  sortOrder?: NoteSortOrder;
  page?: number;
  limit?: number;
}

export interface NoteSearchParams {
  query: string;
  filters?: NoteFilterParams;
  includeContent?: boolean;
  includeAttachments?: boolean;
  includeMetadata?: boolean;
}

// Bulk Operations interfaces
export interface BulkNoteUpdateData {
  noteIds: number[];
  updates: {
    color?: NoteColor;
    category?: NoteCategory;
    priority?: NotePriority;
    status?: NoteStatus;
    tags?: string[];
    isPinned?: boolean;
  };
}

export interface BulkNoteDeleteData {
  noteIds: number[];
  permanentDelete?: boolean;
}

export interface BulkNoteResponse {
  status: ApiStatus;
  message: string;
  data: {
    updated: number;
    failed: number;
    errors?: string[];
  };
}

// Statistics interfaces
export interface NoteStatsResponse {
  totalNotes: number;
  notesByType: Record<NoteType, number>;
  notesByColor: Record<NoteColor, number>;
  notesByCategory: Record<NoteCategory, number>;
  notesByPriority: Record<NotePriority, number>;
  notesByStatus: Record<NoteStatus, number>;
  pinnedNotes: number;
  sharedNotes: number;
  notesWithReminders: number;
  notesWithAttachments: number;
  averageWordsPerNote: number;
  totalWordCount: number;
  mostUsedTags: Array<{ tag: string; count: number; }>;
  activityThisWeek: Array<{ date: string; count: number; }>;
  recentlyModified: Note[];
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
  data: Note[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
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

export interface NoteTemplatesResponse {
  status: ApiStatus;
  message: string;
  data: NoteTemplate[];
}

// Note Template interface
export interface NoteTemplate {
  templateId: number;
  templateName: string;
  description: string;
  noteType: NoteType;
  category: NoteCategory;
  templateContent: string;
  placeholders: string[];
  isPublic: boolean;
  createdBy: number;
  createdDate: string;
  usageCount: number;
  tags: string[];
  preview?: string;
}

// Export and Import interfaces
export interface NoteExportOptions {
  format: 'JSON' | 'CSV' | 'PDF' | 'MARKDOWN' | 'HTML';
  includeAttachments: boolean;
  includeMetadata: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: NoteFilterParams;
}

export interface NoteImportData {
  notes: Partial<Note>[];
  preserveIds: boolean;
  mergeStrategy: 'SKIP' | 'OVERWRITE' | 'MERGE';
}

export interface NoteImportResponse {
  status: ApiStatus;
  message: string;
  data: {
    imported: number;
    skipped: number;
    failed: number;
    errors: string[];
  };
}

// Synchronization interfaces
export interface NoteSyncData {
  lastSyncDate: string;
  localChanges: Note[];
  deletedNoteIds: number[];
}

export interface NoteSyncResponse {
  status: ApiStatus;
  message: string;
  data: {
    serverChanges: Note[];
    conflicts: NoteSyncConflict[];
    lastSyncDate: string;
  };
}

export interface NoteSyncConflict {
  noteId: number;
  localVersion: Note;
  serverVersion: Note;
  conflictFields: string[];
}

// Collaboration interfaces
export interface NoteComment {
  commentId: number;
  noteId: number;
  userId: number;
  userName: string;
  content: string;
  createdDate: string;
  modifiedDate?: string;
  isResolved: boolean;
  parentCommentId?: number;
  replies?: NoteComment[];
}

export interface NoteCommentsResponse {
  status: ApiStatus;
  message: string;
  data: NoteComment[];
}

export interface NoteActivity {
  activityId: number;
  noteId: number;
  userId: number;
  userName: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'SHARED' | 'COMMENTED' | 'VIEWED';
  details: string;
  timestamp: string;
}

export interface NoteActivityResponse {
  status: ApiStatus;
  message: string;
  data: NoteActivity[];
}

// UI State interfaces
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