import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import {
  Note,
  NoteFormData,
  NoteUpdateData,
  NoteFilterParams,
  NoteSearchParams,
  NoteResponse,
  NoteListResponse,
  NoteStatsApiResponse,
  NoteCreateResponse,
  BulkNoteUpdateData,
  BulkNoteDeleteData,
  BulkNoteResponse,
  QuickNoteData,
  NoteCommentsResponse,
  NoteActivityResponse,
  NoteTemplatesResponse,
  NoteExportOptions,
  NoteImportData,
  NoteImportResponse,
  NoteSyncData,
  NoteSyncResponse
} from '../models/Note';
import { 
  NoteType, 
  NoteColor, 
  NoteCategory, 
  NotePriority, 
  NoteStatus
} from '../enums/NoteEnums';
import { ApiStatus } from '../enums/ApiEnums';

class NoteService {
  // Get all notes for a user with optional filters
  async getNotesByUser(userId: number, filters?: NoteFilterParams): Promise<NoteListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.get(`${API_ENDPOINTS.NOTES.GET_BY_USER}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch notes',
        data: []
      };
    }
  }

  // Get a specific note by ID
  async getNoteById(noteId: number): Promise<NoteResponse> {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.NOTES.GET_BY_ID}/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching note:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch note',
        data: undefined
      };
    }
  }

  // Create a new note
  async createNote(userId: number, noteData: NoteFormData): Promise<NoteCreateResponse> {
    try {
      const formData = new FormData();
      
      // Add text data
      formData.append('noteTitle', noteData.noteTitle);
      formData.append('noteContent', noteData.noteContent);
      formData.append('noteType', noteData.noteType);
      formData.append('color', noteData.color);
      formData.append('category', noteData.category);
      formData.append('priority', noteData.priority);
      formData.append('tags', JSON.stringify(noteData.tags));
      
      if (noteData.reminderDate) {
        formData.append('reminderDate', noteData.reminderDate);
      }
      
      if (noteData.checklistItems) {
        formData.append('checklistItems', JSON.stringify(noteData.checklistItems));
      }
      
      if (noteData.drawingData) {
        formData.append('drawingData', JSON.stringify(noteData.drawingData));
      }
      
      if (noteData.linkUrl) {
        formData.append('linkUrl', noteData.linkUrl);
      }
      
      if (noteData.metadata) {
        formData.append('metadata', JSON.stringify(noteData.metadata));
      }
      
      // Add file attachments
      if (noteData.attachments) {
        noteData.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      const response = await axiosInstance.post(API_ENDPOINTS.NOTES.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to create note',
        data: undefined
      };
    }
  }

  // Update an existing note
  async updateNote(noteData: NoteUpdateData): Promise<NoteResponse> {
    try {
      const response = await axiosInstance.put(
        `${API_ENDPOINTS.NOTES.UPDATE}/${noteData.noteId}`,
        noteData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating note:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to update note',
        data: undefined
      };
    }
  }

  // Delete a note
  async deleteNote(noteId: number, permanentDelete: boolean = false): Promise<NoteResponse> {
    try {
      const response = await axiosInstance.delete(
        `${API_ENDPOINTS.NOTES.DELETE}/${noteId}?permanent=${permanentDelete}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting note:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to delete note',
        data: undefined
      };
    }
  }

  // Update note status
  async updateNoteStatus(noteId: number, status: NoteStatus): Promise<NoteResponse> {
    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.NOTES.UPDATE_STATUS}/${noteId}`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating note status:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to update note status',
        data: undefined
      };
    }
  }

  // Toggle note pin status
  async toggleNotePin(noteId: number): Promise<NoteResponse> {
    try {
      const response = await axiosInstance.patch(`${API_ENDPOINTS.NOTES.TOGGLE_PIN}/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error toggling note pin:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to toggle note pin',
        data: undefined
      };
    }
  }

  // Update note color
  async updateNoteColor(noteId: number, color: NoteColor): Promise<NoteResponse> {
    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.NOTES.UPDATE_COLOR}/${noteId}`,
        { color }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating note color:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to update note color',
        data: undefined
      };
    }
  }

  // Get note statistics
  async getNoteStats(userId: number, filters?: NoteFilterParams): Promise<NoteStatsApiResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.get(`${API_ENDPOINTS.NOTES.GET_STATS}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching note statistics:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch note statistics',
        data: undefined
      };
    }
  }

  // Search notes
  async searchNotes(userId: number, searchParams: NoteSearchParams): Promise<NoteListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('query', searchParams.query);
      
      if (searchParams.includeContent !== undefined) {
        params.append('includeContent', searchParams.includeContent.toString());
      }
      
      if (searchParams.includeAttachments !== undefined) {
        params.append('includeAttachments', searchParams.includeAttachments.toString());
      }
      
      if (searchParams.includeMetadata !== undefined) {
        params.append('includeMetadata', searchParams.includeMetadata.toString());
      }
      
      if (searchParams.filters) {
        Object.entries(searchParams.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.get(`${API_ENDPOINTS.NOTES.SEARCH}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching notes:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to search notes',
        data: []
      };
    }
  }

  // Get notes by type
  async getNotesByType(userId: number, noteType: NoteType): Promise<NoteListResponse> {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.NOTES.GET_BY_TYPE}/${noteType}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notes by type:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch notes by type',
        data: []
      };
    }
  }

  // Get notes by category
  async getNotesByCategory(userId: number, category: NoteCategory): Promise<NoteListResponse> {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.NOTES.GET_BY_CATEGORY}/${category}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notes by category:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch notes by category',
        data: []
      };
    }
  }

  // Get pinned notes (userId now extracted from token)
  async getPinnedNotes(): Promise<NoteListResponse> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.NOTES.GET_PINNED);
      return response.data;
    } catch (error) {
      console.error('Error fetching pinned notes:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch pinned notes',
        data: []
      };
    }
  }

  // Get archived notes (userId now extracted from token)
  async getArchivedNotes(): Promise<NoteListResponse> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.NOTES.GET_ARCHIVED);
      return response.data;
    } catch (error) {
      console.error('Error fetching archived notes:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch archived notes',
        data: []
      };
    }
  }

  // Bulk update notes
  async bulkUpdateNotes(data: BulkNoteUpdateData): Promise<BulkNoteResponse> {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.NOTES.BULK_UPDATE, data);
      return response.data;
    } catch (error) {
      console.error('Error bulk updating notes:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to bulk update notes',
        data: { updated: 0, failed: 0 }
      };
    }
  }

  // Bulk delete notes
  async bulkDeleteNotes(data: BulkNoteDeleteData): Promise<BulkNoteResponse> {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.NOTES.BULK_DELETE, { data });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting notes:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to bulk delete notes',
        data: { updated: 0, failed: 0 }
      };
    }
  }

  // Duplicate a note
  async duplicateNote(noteId: number): Promise<NoteCreateResponse> {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.NOTES.DUPLICATE}/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating note:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to duplicate note',
        data: undefined
      };
    }
  }

  // Create quick note
  async createQuickNote(userId: number, quickNoteData: QuickNoteData): Promise<NoteCreateResponse> {
    try {
      const noteData: NoteFormData = {
        noteTitle: quickNoteData.title,
        noteContent: quickNoteData.content,
        noteType: quickNoteData.type || NoteType.TEXT,
        color: quickNoteData.color || NoteColor.DEFAULT,
        category: quickNoteData.category || NoteCategory.PERSONAL,
        priority: quickNoteData.priority || NotePriority.MEDIUM,
        tags: []
      };

      return await this.createNote(userId, noteData);
    } catch (error) {
      console.error('Error creating quick note:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to create quick note',
        data: undefined
      };
    }
  }

  // Get note comments
  async getNoteComments(noteId: number): Promise<NoteCommentsResponse> {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.NOTES.GET_COMMENTS}/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching note comments:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch note comments',
        data: []
      };
    }
  }

  // Add note comment
  async addNoteComment(noteId: number, comment: string): Promise<NoteResponse> {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.NOTES.ADD_COMMENT}/${noteId}`, {
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error adding note comment:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to add note comment',
        data: undefined
      };
    }
  }

  // Get note activity
  async getNoteActivity(noteId: number): Promise<NoteActivityResponse> {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.NOTES.GET_ACTIVITY}/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching note activity:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch note activity',
        data: []
      };
    }
  }

  // Get note templates (userId now extracted from token)
  async getNoteTemplates(): Promise<NoteTemplatesResponse> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.NOTES.GET_TEMPLATES);
      return response.data;
    } catch (error) {
      console.error('Error fetching note templates:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to fetch note templates',
        data: []
      };
    }
  }

  // Create note from template
  async createNoteFromTemplate(userId: number, templateId: number, customData?: Partial<NoteFormData>): Promise<NoteCreateResponse> {
    try {
      const response = await axiosInstance.post(
        `${API_ENDPOINTS.NOTES.CREATE_FROM_TEMPLATE}/${templateId}`,
        {
          userId,
          customData
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating note from template:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to create note from template',
        data: undefined
      };
    }
  }

  // Export notes
  async exportNotes(userId: number, options: NoteExportOptions): Promise<Blob> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.NOTES.EXPORT,
        options,
        {
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting notes:', error);
      throw new Error('Failed to export notes');
    }
  }

  // Import notes
  async importNotes(userId: number, importData: NoteImportData): Promise<NoteImportResponse> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.NOTES.IMPORT,
        importData
      );
      return response.data;
    } catch (error) {
      console.error('Error importing notes:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to import notes',
        data: {
          imported: 0,
          skipped: 0,
          failed: 0,
          errors: ['Import failed']
        }
      };
    }
  }

  // Sync notes
  async syncNotes(userId: number, syncData: NoteSyncData): Promise<NoteSyncResponse> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.NOTES.SYNC,
        syncData
      );
      return response.data;
    } catch (error) {
      console.error('Error syncing notes:', error);
      return {
        status: ApiStatus.ERROR,
        message: 'Failed to sync notes',
        data: {
          serverChanges: [],
          conflicts: [],
          lastSyncDate: new Date().toISOString()
        }
      };
    }
  }

  // Archive note
  async archiveNote(noteId: number): Promise<NoteResponse> {
    return await this.updateNoteStatus(noteId, NoteStatus.ARCHIVED);
  }

  // Restore note from archive
  async restoreNote(noteId: number): Promise<NoteResponse> {
    return await this.updateNoteStatus(noteId, NoteStatus.ACTIVE);
  }

  // Permanently delete note
  async permanentlyDeleteNote(noteId: number): Promise<NoteResponse> {
    return await this.deleteNote(noteId, true);
  }

  // Helper function to format note date
  formatNoteDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Helper function to get note content preview
  getNotePreview(content: string, maxLength: number = 150): string {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  }

  // Helper function to count words in note
  getWordCount(content: string): number {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  // Helper function to check if note has attachments
  hasAttachments(note: Note): boolean {
    return !!(note.attachments && note.attachments.length > 0);
  }

  // Helper function to check if note has reminders
  hasReminder(note: Note): boolean {
    return !!(note.reminderDate && new Date(note.reminderDate) > new Date());
  }

  // Helper function to check if note is shared
  isShared(note: Note): boolean {
    return note.isShared || !!(note.sharedWith && note.sharedWith.length > 0);
  }
}

export const noteService = new NoteService();