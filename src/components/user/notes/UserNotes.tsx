import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../../common/header/Header";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "../../../hooks/useTranslation";
import { noteService } from "../../../services/noteService";
import { 
  Note, 
  NoteFormData, 
  NoteUpdateData, 
  NoteStatsResponse
} from "../../../models/Note";

// Extended stats interface for local use
interface ExtendedNoteStats extends NoteStatsResponse {
  sharedNotes?: number;
  notesWithReminders?: number;
  notesByColor?: Record<string, number>;
  notesByStatus?: Record<string, number>;
  recentlyModified?: Note[];
}
import { 
  NoteType, 
  NoteColor, 
  NoteCategory, 
  NotePriority, 
  NoteStatus,
  NoteViewMode,
  NOTE_TYPE_CONFIG,
  NOTE_COLOR_CONFIG,
  NOTE_CATEGORY_CONFIG,
  NOTE_PRIORITY_CONFIG,
  NOTE_VIEW_MODE_CONFIG
} from "../../../enums/NoteEnums";
import { ApiStatus } from "../../../enums/ApiEnums";
import "./user-notes.css";

const UserNotes: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const userId = user?.userId;

  // State for notes and UI
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<ExtendedNoteStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);



  // View and filter states
  const [viewMode, setViewMode] = useState<NoteViewMode>(NoteViewMode.GRID);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<NoteType | "ALL">("ALL");
  const [colorFilter] = useState<NoteColor | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<NotePriority | "ALL">("ALL");
  const [statusFilter] = useState<NoteStatus | "ALL">("ALL");
  const [sortBy] = useState<"createdDate" | "modifiedDate" | "title" | "priority">("modifiedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  // Enhanced features states
  const [showStickyNotes, setShowStickyNotes] = useState(true);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showRichEditor, setShowRichEditor] = useState(false);
  const [showVoiceNote, setShowVoiceNote] = useState(false);
  const [showDrawingPad, setShowDrawingPad] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  
  // Smart features
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [quickNoteMode, setQuickNoteMode] = useState(false);
  // const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<Note[]>([]);
  const [favoriteNotes, setFavoriteNotes] = useState<number[]>([]);
  const [noteTemplates, setNoteTemplates] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState<NoteFormData>({
    noteTitle: "",
    noteContent: "",
    noteType: NoteType.TEXT,
    color: NoteColor.DEFAULT,
    category: NoteCategory.PERSONAL,
    priority: NotePriority.MEDIUM
  });


  const formRef = useRef<HTMLInputElement | null>(null);

  // Load notes
  const loadNotes = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await noteService.getNotesByUser(userId);
      
      if (response.status === ApiStatus.SUCCESS) {
        // Normalize different possible API response shapes:
        // - response.data => { data: Note[], pagination: {...} }
        // - response.data => { data: { data: Note[], pagination: {...} } } (double-wrapped)
        // - response.data => { notes: Note[], totalCount: number, ... } (legacy)
        // - response.data => Note[] (direct array)
        let notesArray: any[] = [];
        const respData = response.data;

        if (!respData) {
          notesArray = [];
        } else if (Array.isArray(respData)) {
          // response.data is already an array
          notesArray = respData as any[];
        } else if (Array.isArray((respData as any).data)) {
          // response.data.data -> array of notes
          notesArray = (respData as any).data;
        } else if (Array.isArray((respData as any).data?.data)) {
          // response.data.data.data -> nested array
          notesArray = (respData as any).data.data;
        } else if (Array.isArray((respData as any).notes)) {
          // legacy shape: response.data.notes
          notesArray = (respData as any).notes;
        } else {
          notesArray = [];
        }

        // Map raw API note objects (which may use different key names) to our Note shape
        const mappedNotes = notesArray.map((raw: any) => {
          // extract common possible keys
          const id = raw?.userNoteId ?? raw?.user_note_id ?? raw?.noteId ?? raw?.note_id ?? raw?.id;
          const title = raw?.noteTitle ?? raw?.note_title ?? raw?.title ?? raw?.name ?? '';
          const content = raw?.noteContent ?? raw?.note_content ?? raw?.content ?? raw?.body ?? '';
          const createdDate = raw?.createdDate ?? raw?.created_date ?? raw?.createdAt ?? raw?.created_at ?? new Date().toISOString();
          const modifiedDate = raw?.modifiedDate ?? raw?.modified_date ?? raw?.updatedAt ?? raw?.updated_at ?? createdDate;

          const mapped: Note = {
            userNoteId: Number(id) || 0,
            userId: Number(raw?.userId ?? raw?.user_id) || (userId as number) || 0,
            noteTitle: String(title),
            noteContent: String(content),
            noteType: (raw?.noteType ?? raw?.type) ?? NoteType.TEXT,
            color: (raw?.color ?? NoteColor.DEFAULT) as any,
            category: (raw?.category ?? NoteCategory.PERSONAL) as any,
            priority: (raw?.priority ?? NotePriority.MEDIUM) as any,
            status: (raw?.status ?? NoteStatus.ACTIVE) as any,
            isPinned: !!(raw?.isPinned ?? raw?.pinned ?? raw?.is_pinned),
            isShared: !!(raw?.isShared ?? raw?.shared),
            reminderDate: raw?.reminderDate ?? raw?.reminder_date ?? undefined,
            version: Number(raw?.version) || 1,
            accessCount: Number(raw?.accessCount ?? raw?.access_count) || 0,
            lastAccessedDate: raw?.lastAccessedDate ?? raw?.last_accessed_date ?? undefined,
            createdDate: String(createdDate),
            modifiedDate: String(modifiedDate),
          } as Note;

          return mapped;
        });

        // Keep only notes that have a valid id and at least a title/content
        const validNotes = mappedNotes.filter(n => n && n.userNoteId && (n.noteTitle || n.noteContent !== undefined));

        // If mapping produced no valid notes but raw array had items, fall back to trying to use raw objects directly
        if (validNotes.length === 0 && notesArray.length > 0) {
          console.warn('No mapped notes matched expected shape; attempting to use raw objects as-is');
          // Try a permissive check to include any objects that look like notes
          const permissive = notesArray.filter((item: any) => item && typeof item === 'object');
          setNotes(permissive as Note[]);
        } else {
          setNotes(validNotes);
        }

        if (validNotes.length !== notesArray.length) {
          console.warn(`Normalized notes: kept ${validNotes.length} of ${notesArray.length} items`);
        }
      } else {
        toast.error(response.message || "Failed to load notes");
        setNotes([]);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Failed to load notes");
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load note statistics
  const loadStats = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await noteService.getNoteStats(userId);
      if (response.status === ApiStatus.SUCCESS && response.data) {
        // Process the API response to match expected interface and capture additional data
        const apiData = response.data as any;
        console.log('Raw API stats data:', apiData);
        
        const processedStats: ExtendedNoteStats = {
          totalNotes: apiData.totalNotes || 0,
          activeNotes: apiData.notesByStatus?.ACTIVE || 0,
          archivedNotes: apiData.notesByStatus?.ARCHIVED || 0,
          pinnedNotes: apiData.pinnedNotes || 0,
          notesByCategory: apiData.notesByCategory || {},
          notesByPriority: apiData.notesByPriority || {},
          notesByType: apiData.notesByType || {},
          // Additional stats from API
          sharedNotes: apiData.sharedNotes || 0,
          notesWithReminders: apiData.notesWithReminders || 0,
          notesByColor: apiData.notesByColor || {},
          notesByStatus: apiData.notesByStatus || {},
          recentlyModified: apiData.recentlyModified || []
        };
        
        console.log('Processed stats:', processedStats);
        setStats(processedStats);
      }
    } catch (error) {
      console.error("Error loading note stats:", error);
    }
  }, [userId]);

  // Filter and sort notes
  useEffect(() => {
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.noteTitle.toLowerCase().includes(query) ||
        note.noteContent.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter(note => note.noteType === typeFilter);
    }

    // Apply color filter
    if (colorFilter !== "ALL") {
      filtered = filtered.filter(note => note.color === colorFilter);
    }

    // Apply category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter(note => note.category === categoryFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "ALL") {
      filtered = filtered.filter(note => note.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(note => note.status === statusFilter);
    }

    // Sort notes
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "title":
          comparison = a.noteTitle.localeCompare(b.noteTitle);
          break;
        case "priority":
          const priorityOrder = { [NotePriority.URGENT]: 4, [NotePriority.HIGH]: 3, [NotePriority.MEDIUM]: 2, [NotePriority.LOW]: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case "createdDate":
          comparison = a.createdDate.localeCompare(b.createdDate);
          break;
        case "modifiedDate":
        default:
          comparison = a.modifiedDate.localeCompare(b.modifiedDate);
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredNotes(filtered);
  }, [notes, searchQuery, typeFilter, colorFilter, categoryFilter, priorityFilter, statusFilter, sortBy, sortOrder]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      if (editing) {
        const updateData: NoteUpdateData = {
          userNoteId: editing.userNoteId,
          ...formData
        };
        const response = await noteService.updateNote(updateData);
        if (response.status === ApiStatus.SUCCESS) {
          toast.success("Note updated successfully");
          setShowModal(false);
          setEditing(null);
          loadNotes();
        } else {
          toast.error(response.message || "Failed to update note");
        }
      } else {
        const response = await noteService.createNote(userId, formData);
        if (response.status === ApiStatus.SUCCESS) {
          toast.success("Note created successfully");
          setShowModal(false);
          loadNotes();
        } else {
          toast.error(response.message || "Failed to create note");
        }
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
  };

  // Handle note deletion
  const handleDelete = async () => {
    if (!deletingNote) return;
    
    try {
      const response = await noteService.deleteNote(deletingNote.userNoteId);
      if (response.status === ApiStatus.SUCCESS) {
        toast.success("Note deleted successfully");
        setShowDeleteModal(false);
        setDeletingNote(null);
        loadNotes();
      } else {
        toast.error(response.message || "Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  // Toggle note pin
  const handleTogglePin = async (noteId: number) => {
    try {
      const response = await noteService.toggleNotePin(noteId);
      if (response.status === ApiStatus.SUCCESS) {
        toast.success("Note pin status updated");
        loadNotes();
      } else {
        toast.error(response.message || "Failed to update pin status");
      }
    } catch (error) {
      console.error("Error updating pin status:", error);
      toast.error("Failed to update pin status");
    }
  };

  // Open modal for new note
  const openNewNoteModal = () => {
    setEditing(null);
    setFormData({
      noteTitle: "",
      noteContent: "",
      noteType: NoteType.TEXT,
      color: NoteColor.DEFAULT,
      category: NoteCategory.PERSONAL,
      priority: NotePriority.MEDIUM
    });
    setShowModal(true);
    setTimeout(() => formRef.current?.focus(), 100);
  };

  // Open modal for editing note
  const openEditNoteModal = (note: Note) => {
    setEditing(note);
    setFormData({
      noteTitle: note.noteTitle,
      noteContent: note.noteContent,
      noteType: note.noteType,
      color: note.color,
      category: note.category,
      priority: note.priority
    });
    setShowModal(true);
    setTimeout(() => formRef.current?.focus(), 100);
  };

  // Toggle favorite notes
  const handleToggleFavorite = (noteId: number) => {
    setFavoriteNotes(prev => {
      if (prev.includes(noteId)) {
        return prev.filter(id => id !== noteId);
      } else {
        return [...prev, noteId];
      }
    });
  };

  // Handle viewing a note and track recently viewed
  const handleViewNote = (note: Note) => {
    setViewingNote(note);
    setShowViewModal(true);
    
    // Update recently viewed (keep last 5, remove duplicates)
    setRecentlyViewed(prev => {
      const filtered = prev.filter(n => n.userNoteId !== note.userNoteId);
      return [note, ...filtered].slice(0, 5);
    });
  };



  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Get note preview
  const getNotePreview = (content: string, maxLength: number = 100) => {
    if (!content) return "No content";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Enhanced Functions for additional features
  const exportNotes = () => {
    try {
      const exportData = {
        notes: filteredNotes,
        exportDate: new Date().toISOString(),
        totalCount: filteredNotes.length
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success("Notes exported successfully");
    } catch (error) {
      console.error("Error exporting notes:", error);
      toast.error("Failed to export notes");
    }
  };

  const handleBulkPin = async () => {
    try {
      for (const noteId of selectedNotes) {
        await noteService.toggleNotePin(noteId);
      }
      toast.success(`${selectedNotes.length} notes pinned`);
      setSelectedNotes([]);
      setShowBulkActions(false);
      loadNotes();
    } catch (error) {
      console.error("Error bulk pinning notes:", error);
      toast.error("Failed to pin notes");
    }
  };

  const handleBulkUnpin = async () => {
    try {
      for (const noteId of selectedNotes) {
        await noteService.toggleNotePin(noteId);
      }
      toast.success(`${selectedNotes.length} notes unpinned`);
      setSelectedNotes([]);
      setShowBulkActions(false);
      loadNotes();
    } catch (error) {
      console.error("Error bulk unpinning notes:", error);
      toast.error("Failed to unpin notes");
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedNotes.length} selected notes?`)) {
      try {
        for (const noteId of selectedNotes) {
          await noteService.deleteNote(noteId);
        }
        toast.success(`${selectedNotes.length} notes deleted`);
        setSelectedNotes([]);
        setShowBulkActions(false);
        loadNotes();
      } catch (error) {
        console.error("Error bulk deleting notes:", error);
        toast.error("Failed to delete notes");
      }
    }
  };

  const hasSelectedNotes = selectedNotes.length > 0;

  // Smart Features Functions
  const generateSearchSuggestions = useCallback((query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
      return;
    }

    const suggestions = [
      ...notes.map(note => note.noteTitle),
      'meeting notes', 'project ideas', 'todo items', 'personal thoughts'
    ]
      .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, 5);

    setSearchSuggestions(suggestions);
    setShowSearchSuggestions(suggestions.length > 0);
  }, [notes]);



  // Enhanced search with smart suggestions
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    generateSearchSuggestions(query);
  }, [generateSearchSuggestions]);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await loadNotes();
        await loadStats();
      } catch (error) {
        console.error("Error initializing Notes component:", error);
      }
    };

    if (userId) {
      initializeComponent();
    }
    
    // Initialize templates
    const defaultTemplates = [
      {
        id: 'meeting',
        name: t('notes.templatesSection.meetingNotes'),
        icon: 'fa-users',
        template: {
          noteTitle: t('notes.templatesSection.meeting', { date: '{{date}}' }),
          noteContent: `# ${t('notes.templatesSection.meetingNotes')}\n\n**Date:** {{date}}\n**Attendees:** \n\n## Agenda\n- \n\n## Discussion\n\n## Action Items\n- [ ] \n\n## Next Steps\n`,
          noteType: NoteType.TEXT,
          category: NoteCategory.WORK
        }
      },
      {
        id: 'project',
        name: t('notes.templatesSection.projectPlan'),
        icon: 'fa-project-diagram',
        template: {
          noteTitle: t('notes.templatesSection.project', { name: '{{name}}' }),
          noteContent: `# Project Overview\n\n**Project Name:** \n**Start Date:** {{date}}\n**Deadline:** \n\n## Objectives\n- \n\n## Milestones\n- [ ] \n\n## Resources\n- \n\n## Notes\n`,
          noteType: NoteType.TEXT,
          category: NoteCategory.WORK
        }
      },
      {
        id: 'idea',
        name: t('notes.templatesSection.ideaCapture'),
        icon: 'fa-lightbulb',
        template: {
          noteTitle: t('notes.templatesSection.idea', { title: '{{title}}' }),
          noteContent: `# ${t('notes.templatesSection.ideaCapture')}\n\n**Date:** {{date}}\n\n## Description\n\n## Potential Impact\n\n## Next Steps\n- [ ] Research\n- [ ] Prototype\n- [ ] Validate\n\n## Related Links\n`,
          noteType: NoteType.TEXT,
          category: NoteCategory.PERSONAL
        }
      }
    ];
    setNoteTemplates(defaultTemplates);
  }, [userId, loadNotes, loadStats, t]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown')) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  if (!userId) {
    return (
      <div className="container-fluid py-3">
        <Header title={t('notes.title')} subtitle={t('notes.subtitle')} />
        <div className="alert alert-warning">{t('notes.pleaseLoginToViewNotes')}</div>
      </div>
    );
  }

  // Show loading state while component initializes
  if (isLoading && notes.length === 0) {
    return (
      <div className="container-fluid py-3">
        <Header title={t('notes.title')} subtitle={t('notes.subtitle')} />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading notes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <Header title={t('notes.title')} subtitle={t('notes.subtitle')} />

      {/* Two-Column Layout: Statistics Sidebar + Main Content */}
      <div className="row g-3">
        {/* Left Sidebar - Statistics & Analytics */}
        <div className="col-lg-3">
          <div className="statistics-sidebar">
            {/* Statistics Cards - Single Row */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="card stat-card">
                  <div className="card-body py-2">
                    <div className="row text-center">
                      <div className="col-3">
                        <h6 className="card-title text-primary mb-0">{stats?.totalNotes ?? notes.length}</h6>
                        <p className="card-text small mb-0">Total</p>
                      </div>
                      <div className="col-3">
                        <h6 className="card-title text-warning mb-0">{stats?.pinnedNotes ?? notes.filter(n => n.isPinned).length}</h6>
                        <p className="card-text small mb-0">Pinned</p>
                      </div>
                      <div className="col-3">
                        <h6 className="card-title text-info mb-0">{stats?.activeNotes ?? notes.filter(n => n.status === 'ACTIVE').length}</h6>
                        <p className="card-text small mb-0">Active</p>
                      </div>
                      <div className="col-3">
                        <h6 className="card-title text-success mb-0">{stats?.archivedNotes ?? notes.filter(n => n.status === 'ARCHIVED').length}</h6>
                        <p className="card-text small mb-0">Archived</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes by Category */}
            <div className="card mb-3">
              <div className="card-header bg-transparent py-2">
                <h6 className="mb-0 small">
                  <i className="fa fa-tags text-primary me-2"></i>
                  Categories
                </h6>
              </div>
              <div className="card-body py-2">
                {stats?.notesByCategory && Object.keys(stats.notesByCategory).length > 0 ? (
                  <div className="category-stats" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {Object.entries(stats.notesByCategory).map(([category, count]) => (
                      <div key={category} className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center">
                          <i className="fa fa-folder text-muted me-2"></i>
                          <span className="text-capitalize small">{category.toLowerCase().replace('_', ' ')}</span>
                        </div>
                        <span className="badge bg-light text-dark small">{String(count)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center small">No data</p>
                )}
              </div>
            </div>

            {/* Notes by Priority */}
            <div className="card mb-3">
              <div className="card-header bg-transparent py-2">
                <h6 className="mb-0 small">
                  <i className="fa fa-exclamation-triangle text-warning me-2"></i>
                  Priorities
                </h6>
              </div>
              <div className="card-body py-2">
                {stats?.notesByPriority && Object.keys(stats.notesByPriority).length > 0 ? (
                  <div className="priority-stats" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {Object.entries(stats.notesByPriority).map(([priority, count]) => {
                      const priorityColors: { [key: string]: string } = {
                        'URGENT': 'danger',
                        'HIGH': 'warning', 
                        'MEDIUM': 'info',
                        'LOW': 'success'
                      };
                      return (
                        <div key={priority} className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center">
                            <i className={`fa fa-flag text-${priorityColors[priority] || 'muted'} me-2`}></i>
                            <span className="text-capitalize small">{priority.toLowerCase()}</span>
                          </div>
                          <span className={`badge bg-${priorityColors[priority] || 'secondary'} small`}>{String(count)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted text-center small">No data</p>
                )}
              </div>
            </div>

            {/* Notes by Color & Status */}
            <div className="card mb-3">
              <div className="card-header bg-transparent py-2">
                <h6 className="mb-0 small">
                  <i className="fa fa-palette text-info me-2"></i>
                  Distribution
                </h6>
              </div>
              <div className="card-body py-2">
                {/* Colors */}
                {stats?.notesByColor && Object.keys(stats.notesByColor).length > 0 && (
                  <div className="mb-3">
                    <h6 className="small text-muted mb-2">Colors</h6>
                    <div className="color-stats" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                      {Object.entries(stats.notesByColor).slice(0, 5).map(([color, count]) => {
                        const colorMap: { [key: string]: string } = {
                          'YELLOW': '#ffd700', 'ORANGE': '#ff8c00', 'RED': '#ff6b6b',
                          'PINK': '#ff69b4', 'PURPLE': '#9b59b6', 'BLUE': '#3498db',
                          'TEAL': '#1abc9c', 'GREEN': '#2ecc71', 'BROWN': '#8b4513',
                          'GREY': '#95a5a6', 'DEFAULT': '#e9ecef'
                        };
                        return (
                          <div key={color} className="d-flex align-items-center mb-1">
                            <div 
                              className="color-indicator me-2" 
                              style={{ 
                                width: '12px', height: '12px', 
                                backgroundColor: colorMap[color] || '#e9ecef',
                                borderRadius: '50%', border: '1px solid #dee2e6'
                              }}
                            ></div>
                            <span className="text-capitalize small me-auto">{color.toLowerCase()}</span>
                            <span className="badge bg-light text-dark small">{String(count)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Status */}
                {stats?.notesByStatus && Object.keys(stats.notesByStatus).length > 0 && (
                  <div>
                    <h6 className="small text-muted mb-2">Status</h6>
                    <div className="status-stats">
                      {Object.entries(stats.notesByStatus).map(([status, count]) => {
                        const statusColors: { [key: string]: string } = {
                          'ACTIVE': 'success', 'ARCHIVED': 'info', 'DELETED': 'danger', 'PINNED': 'warning'
                        };
                        return (
                          <div key={status} className="d-flex align-items-center mb-1">
                            <i className={`fa fa-circle text-${statusColors[status] || 'muted'} me-2`}></i>
                            <span className="text-capitalize small me-auto">{status.toLowerCase()}</span>
                            <span className={`badge bg-${statusColors[status] || 'secondary'} small`}>{String(count)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="card mb-3">
              <div className="card-header bg-transparent py-2">
                <h6 className="mb-0 small">
                  <i className="fa fa-chart-line text-success me-2"></i>
                  Metrics
                </h6>
              </div>
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <i className="fa fa-share text-info me-2"></i>
                    <span className="small">Shared</span>
                  </div>
                  <span className="badge bg-info">{stats?.sharedNotes ?? 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <i className="fa fa-bell text-warning me-2"></i>
                    <span className="small">Reminders</span>
                  </div>
                  <span className="badge bg-warning">{stats?.notesWithReminders ?? 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <i className="fa fa-file-text text-primary me-2"></i>
                    <span className="small">Text Notes</span>
                  </div>
                  <span className="badge bg-primary">{stats?.notesByType?.TEXT ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content - Notes Area */}
        <div className="col-lg-9">
          <div className="notes-main-content">
            {/* Recently Modified Notes - Compact Version */}
      {stats?.recentlyModified && stats.recentlyModified.length > 0 && (
        <div className="row mb-2">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-transparent py-1">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 small">
                    <i className="fa fa-clock text-info me-2"></i>
                    Recently Modified
                  </h6>
                  <small className="text-muted">Last 3 notes</small>
                </div>
              </div>
              <div className="card-body py-1">
                <div className="d-flex gap-2 flex-wrap">
                  {stats.recentlyModified.slice(0, 3).map((note: any) => (
                    <div key={note.userNoteId} className="flex-fill">
                      <div className="small p-2 bg-light rounded">
                        <div className="fw-bold text-truncate">{note.noteTitle}</div>
                        <div className="text-muted small text-truncate">{note.noteContent}</div>
                        <div className="d-flex gap-1 mt-1">
                          <span className={`badge bg-${note.priority === 'URGENT' ? 'danger' : note.priority === 'HIGH' ? 'warning' : 'info'} badge-sm`}>
                            {note.priority}
                          </span>
                          <span className="badge bg-secondary badge-sm">{note.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions & Templates */}
      <div className="row mb-3">
        <div className="col-md-8">
          <div className="card quick-actions-card">
            <div className="card-header bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fa fa-bolt text-primary me-2"></i>
                  {t('notes.quickActions')}
                </h6>
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="quickNoteMode"
                    checked={quickNoteMode}
                    onChange={(e) => setQuickNoteMode(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="quickNoteMode">
                    {t('notes.quickMode')}
                  </label>
                </div>
              </div>
            </div>
            <div className="card-body p-3">
              {quickNoteMode ? (
                <div className="quick-note-input">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('notes.quickNotePlaceholder')}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          if (target.value.trim()) {
                            const quickNote = {
                              noteTitle: target.value.trim(),
                              noteContent: target.value.trim(),
                              noteType: NoteType.TEXT,
                              color: NoteColor.DEFAULT,
                              category: NoteCategory.PERSONAL,
                              priority: NotePriority.MEDIUM
                            };
                            setFormData(quickNote);
                            handleSubmit(e as any);
                            target.value = '';
                          }
                        }
                      }}
                    />
                    <button className="btn btn-outline-primary" type="button">
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="row g-2">
                  <div className="col-auto">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={openNewNoteModal}
                    >
                      <i className="fa fa-plus me-1"></i>{t('notes.newNote')}
                    </button>
                  </div>
                  <div className="col-auto">
                    <button 
                      className="btn btn-outline-success btn-sm"
                      onClick={() => setQuickNoteMode(true)}
                    >
                      <i className="fa fa-bolt me-1"></i>{t('notes.quickNote')}
                    </button>
                  </div>
                  <div className="col-auto">
                    <button 
                      className="btn btn-outline-info btn-sm"
                      onClick={() => toast.info(t('notes.voiceNoteComingSoon'))}
                    >
                      <i className="fa fa-microphone me-1"></i>{t('notes.voiceNote')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card templates-card">
            <div className="card-header bg-transparent">
              <h6 className="mb-0">
                <i className="fa fa-file-text text-success me-2"></i>
                {t('notes.templates')}
              </h6>
            </div>
            <div className="card-body p-2">
              <div className="template-grid">
                {noteTemplates.slice(0, 3).map(template => (
                  <button
                    key={template.id}
                    className="btn btn-outline-secondary btn-sm w-100 mb-2 template-btn"
                    onClick={() => {
                      const templateData = {
                        ...template.template,
                        noteTitle: template.template.noteTitle.replace('{{date}}', new Date().toLocaleDateString()),
                        noteContent: template.template.noteContent.replace('{{date}}', new Date().toLocaleDateString())
                      };
                      setFormData(templateData);
                      setShowModal(true);
                    }}
                  >
                    <i className={`fa ${template.icon} me-2`}></i>
                    {template.name}
                  </button>
                ))}
                <button 
                  className="btn btn-link btn-sm w-100 text-muted"
                  onClick={() => toast.info(t('notes.moreTemplatesComingSoon'))}
                >
                  <i className="fa fa-plus me-1"></i>{t('notes.moreTemplates')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card recent-notes-card">
              <div className="card-header bg-transparent">
                <h6 className="mb-0">
                  <i className="fa fa-history text-info me-2"></i>
                  {t('notes.recentlyViewed')}
                </h6>
              </div>
              <div className="card-body p-2">
                <div className="recent-notes-list">
                  {recentlyViewed.map(note => (
                    <div 
                      key={note.userNoteId} 
                      className="recent-note-item"
                      onClick={() => handleViewNote(note)}
                    >
                      <div className="d-flex align-items-center">
                        <i className={`fa ${NOTE_TYPE_CONFIG[note.noteType]?.icon || 'fa-file-text'} me-2 text-primary`}></i>
                        <div className="flex-grow-1">
                          <div className="recent-note-title">{note.noteTitle}</div>
                          <small className="text-muted">{new Date(note.modifiedDate || note.createdDate).toLocaleDateString()}</small>
                        </div>
                        {favoriteNotes.includes(note.userNoteId) && (
                          <i className="fa fa-heart text-danger"></i>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Notes Section */}
      {showStickyNotes && filteredNotes.filter(note => note.isPinned).length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="fa fa-thumbtack text-warning me-2"></i>
                {t('notes.stickyNotes')}
              </h5>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowStickyNotes(!showStickyNotes)}
              >
                <i className={`fa fa-${showStickyNotes ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
            <div className="sticky-notes-container">
              <div className="row">
                {filteredNotes.filter(note => note.isPinned).slice(0, 3).map((note: Note) => (
                  <div key={note.userNoteId} className="col-md-4 mb-3">
                    <div 
                      className="card sticky-note shadow-sm"
                      style={{ 
                        backgroundColor: `${NOTE_COLOR_CONFIG[note.color]?.value || '#ffffff'}20`,
                        borderLeft: `4px solid ${NOTE_COLOR_CONFIG[note.color]?.value || '#dee2e6'}`,
                        minHeight: '120px'
                      }}
                    >
                      <div className="card-body p-3">
                        <h6 className="card-title text-truncate mb-2">{note.noteTitle}</h6>
                        <p className="card-text small text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                          {note.noteContent.substring(0, 80)}
                          {note.noteContent.length > 80 && '...'}
                        </p>
                        <div className="position-absolute top-0 start-0 p-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedNotes.includes(note.userNoteId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotes([...selectedNotes, note.userNoteId]);
                              } else {
                                setSelectedNotes(selectedNotes.filter(id => id !== note.userNoteId));
                              }
                            }}
                          />
                        </div>
                        <div className="position-absolute top-0 end-0 p-2">
                          <i className="fa fa-thumbtack text-warning" style={{ fontSize: '0.8rem' }}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="card mb-2 control-card shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-auto">
              <button className="btn btn-primary btn-sm" onClick={openNewNoteModal}>
                <i className="fa fa-plus me-2"></i>New Note
              </button>
              <button 
                className="btn btn-outline-primary btn-sm ms-2" 
                onClick={loadNotes}
                disabled={isLoading}
                title="Refresh Notes"
              >
                <i className={`fa fa-refresh ${isLoading ? 'fa-spin' : ''} me-1`}></i>
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            <div className="col-auto">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSearchSuggestions(searchSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  style={{ width: "250px" }}
                />
                {showSearchSuggestions && (
                  <div className="search-suggestions">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="search-suggestion-item"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSearchSuggestions(false);
                        }}
                      >
                        <i className="fa fa-search me-2"></i>
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="col-auto">
              <div className="btn-group" role="group">
                {Object.values(NoteViewMode).map(mode => (
                  <button
                    key={mode}
                    className={`btn btn-outline-secondary btn-sm ${viewMode === mode ? "active" : ""}`}
                    onClick={() => setViewMode(mode)}
                    title={NOTE_VIEW_MODE_CONFIG[mode].description}
                  >
                    <i className={`fa ${NOTE_VIEW_MODE_CONFIG[mode].icon}`}></i>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-auto">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as NoteType | "ALL")}
              >
                <option value="ALL">All Types</option>
                {Object.values(NoteType).map(type => (
                  <option key={type} value={type}>
                    {NOTE_TYPE_CONFIG[type].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Enhanced Options */}
            <div className="col-auto">
              <div className="btn-group" role="group">
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={() => toast.info("Templates feature coming soon!")}
                  title="Use Templates"
                >
                  <i className="fa fa-file-text"></i>
                </button>
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => toast.info("Import feature coming soon!")}
                  title="Import Notes"
                >
                  <i className="fa fa-upload"></i>
                </button>
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => exportNotes()}
                  title="Export Notes"
                >
                  <i className="fa fa-download"></i>
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {hasSelectedNotes && (
              <div className="col-auto">
                <div className="btn-group" role="group">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    title="Bulk Actions"
                  >
                    <i className="fa fa-check-square me-1"></i>
                    {selectedNotes.length} selected
                  </button>
                  {showBulkActions && (
                    <div className="dropdown-menu show position-relative">
                      <button
                        className="dropdown-item"
                        onClick={() => handleBulkPin()}
                      >
                        <i className="fa fa-thumbtack me-2"></i>Pin Selected
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => handleBulkUnpin()}
                      >
                        <i className="fa fa-thumbtack me-2 text-muted"></i>Unpin Selected
                      </button>
                      <div className="dropdown-divider"></div>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => handleBulkDelete()}
                      >
                        <i className="fa fa-trash me-2"></i>Delete Selected
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Tools */}
            <div className="col-auto">
              <div className="btn-group" role="group">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowRichEditor(!showRichEditor)}
                  title="Toggle Rich Editor"
                >
                  <i className="fa fa-edit"></i>
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowVoiceNote(!showVoiceNote)}
                  title="Voice Notes"
                >
                  <i className="fa fa-microphone"></i>
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowDrawingPad(!showDrawingPad)}
                  title="Drawing Pad"
                >
                  <i className="fa fa-paint-brush"></i>
                </button>
              </div>
            </div>

            <div className="col-auto">
              <select
                className="form-select form-select-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as NoteCategory | "ALL")}
              >
                <option value="ALL">All Categories</option>
                {Object.values(NoteCategory).map(category => (
                  <option key={category} value={category}>
                    {NOTE_CATEGORY_CONFIG[category].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-auto">
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as NotePriority | "ALL")}
              >
                <option value="ALL">All Priority</option>
                {Object.values(NotePriority).map(priority => (
                  <option key={priority} value={priority}>
                    {NOTE_PRIORITY_CONFIG[priority].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-auto">
              <div className="btn-group" role="group">
                <button
                  className={`btn btn-outline-secondary btn-sm ${sortOrder === "asc" ? "active" : ""}`}
                  onClick={() => setSortOrder("asc")}
                >
                  <i className="fa fa-sort-up"></i>
                </button>
                <button
                  className={`btn btn-outline-secondary btn-sm ${sortOrder === "desc" ? "active" : ""}`}
                  onClick={() => setSortOrder("desc")}
                >
                  <i className="fa fa-sort-down"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Display */}
      <div className="card shadow-sm">
        <div className="card-header">
          <h6 className="mb-0">
            Notes ({filteredNotes.length})
            {selectedNotes.length > 0 && (
              <span className="ms-2 text-muted">({selectedNotes.length} selected)</span>
            )}
          </h6>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className="fa fa-sticky-note fa-3x mb-3"></i>
              {notes.length > 0 ? (
                <div>
                  <p>No notes match your current filters</p>
                  <button 
                    className="btn btn-outline-secondary btn-sm me-2" 
                    onClick={() => {
                      setSearchQuery("");
                      setTypeFilter("ALL");
                      setCategoryFilter("ALL");
                      setPriorityFilter("ALL");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div>
                  <p>No notes found</p>
                  <button className="btn btn-primary btn-sm" onClick={openNewNoteModal}>
                    Create Your First Note
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`notes-container ${viewMode.toLowerCase()}-view p-3`}>
              {viewMode === NoteViewMode.LIST ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedNotes.length === filteredNotes.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotes(filteredNotes.map(n => n.userNoteId));
                              } else {
                                setSelectedNotes([]);
                              }
                            }}
                          />
                        </th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Modified</th>
                        <th style={{ width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotes.map((note) => (
                        <tr key={note.userNoteId}>
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedNotes.includes(note.userNoteId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedNotes([...selectedNotes, note.userNoteId]);
                                } else {
                                  setSelectedNotes(selectedNotes.filter(id => id !== note.userNoteId));
                                }
                              }}
                            />
                          </td>
                          <td>
                            <div>
                              <strong 
                                className="note-title" 
                                onClick={() => handleViewNote(note)}
                                style={{ cursor: "pointer" }}
                              >
                                {note.isPinned && <i className="fa fa-thumbtack me-1 text-warning"></i>}
                                {note.noteTitle || "Untitled Note"}
                              </strong>
                              <small className="text-muted d-block">
                                {getNotePreview(note.noteContent || "", 50)}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              <i className={`fa ${NOTE_TYPE_CONFIG[note.noteType]?.icon || 'fa-file'} me-1`}></i>
                              {NOTE_TYPE_CONFIG[note.noteType]?.label || note.noteType}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              <i className={`fa ${NOTE_CATEGORY_CONFIG[note.category]?.icon || 'fa-folder'} me-1`}></i>
                              {NOTE_CATEGORY_CONFIG[note.category]?.label || note.category}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${NOTE_PRIORITY_CONFIG[note.priority]?.badgeClass || 'bg-secondary'}`}>
                              <i className={`fa ${NOTE_PRIORITY_CONFIG[note.priority]?.icon || 'fa-exclamation'} me-1`}></i>
                              {NOTE_PRIORITY_CONFIG[note.priority]?.label || note.priority}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">{formatDate(note.modifiedDate)}</small>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => openEditNoteModal(note)}
                                title="Edit Note"
                              >
                                <i className="fa fa-edit"></i>
                              </button>
                              <button
                                className={`btn btn-outline-${note.isPinned ? 'warning' : 'secondary'} btn-sm`}
                                onClick={() => handleTogglePin(note.userNoteId)}
                                title={note.isPinned ? "Unpin Note" : "Pin Note"}
                              >
                                <i className="fa fa-thumbtack"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  setDeletingNote(note);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete Note"
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`row ${viewMode === NoteViewMode.GRID ? 'g-3' : viewMode === NoteViewMode.COMPACT ? 'g-2' : 'g-1'}`}>
                  {filteredNotes.map((note) => (
                    <div 
                      key={note.userNoteId} 
                      className={`${
                        viewMode === NoteViewMode.GRID ? 'col-md-4 col-lg-3' :
                        viewMode === NoteViewMode.COMPACT ? 'col-md-6 col-lg-4' :
                        'col-md-3 col-lg-2'
                      }`}
                    >
                      <div 
                        className={`card note-card h-100`}
                        style={{ 
                          backgroundColor: NOTE_COLOR_CONFIG[note.color]?.value || '#ffffff',
                          color: NOTE_COLOR_CONFIG[note.color]?.textColor || '#000000',
                          borderColor: NOTE_COLOR_CONFIG[note.color]?.value || '#dee2e6'
                        }}
                      >
                        <div className="card-header border-0 p-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="card-title mb-1">
                                {note.isPinned && <i className="fa fa-thumbtack me-1 text-warning"></i>}
                                {favoriteNotes.includes(note.userNoteId) && <i className="fa fa-heart me-1 text-danger"></i>}
                                {note.noteTitle || "Untitled Note"}
                              </h6>
                              <div className="d-flex gap-1">
                                <span className={`badge ${NOTE_PRIORITY_CONFIG[note.priority]?.badgeClass || 'bg-secondary'} badge-sm`}>
                                  {NOTE_PRIORITY_CONFIG[note.priority]?.label || note.priority}
                                </span>
                                <span className="badge bg-secondary badge-sm">
                                  {NOTE_TYPE_CONFIG[note.noteType]?.label || note.noteType}
                                </span>
                              </div>
                            </div>
                            <div className="dropdown position-relative">
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(openDropdown === note.userNoteId ? null : note.userNoteId);
                                }}
                              >
                                <i className="fa fa-ellipsis-v"></i>
                              </button>
                              {openDropdown === note.userNoteId && (
                                <ul className="dropdown-menu show dropdown-menu-end">
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewNote(note);
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      <i className="fa fa-eye me-2"></i>View
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditNoteModal(note);
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      <i className="fa fa-edit me-2"></i>Edit
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePin(note.userNoteId);
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      <i className="fa fa-thumbtack me-2"></i>
                                      {note.isPinned ? "Unpin" : "Pin"}
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavorite(note.userNoteId);
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      <i className={`fa ${favoriteNotes.includes(note.userNoteId) ? 'fa-heart text-danger' : 'fa-heart-o'} me-2`}></i>
                                      {favoriteNotes.includes(note.userNoteId) ? "Remove from Favorites" : "Add to Favorites"}
                                    </button>
                                  </li>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <button 
                                      className="dropdown-item text-danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingNote(note);
                                        setShowDeleteModal(true);
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      <i className="fa fa-trash me-2"></i>Delete
                                    </button>
                                  </li>
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="card-body p-2">
                          <p className="card-text" style={{ fontSize: viewMode === NoteViewMode.COMPACT ? '0.85rem' : '0.9rem' }}>
                            {getNotePreview(note.noteContent || "", viewMode === NoteViewMode.MASONRY ? 200 : 100)}
                          </p>
                        </div>
                        <div className="card-footer border-0 p-2">
                          <small className="text-muted">
                            <i className="fa fa-clock me-1"></i>
                            {formatDate(note.modifiedDate || note.createdDate)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Note Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editing ? "Edit Note" : "New Note"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Note Title *</label>
                      <input
                        ref={formRef}
                        type="text"
                        className="form-control"
                        value={formData.noteTitle}
                        onChange={(e) => setFormData({ ...formData, noteTitle: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Content *</label>
                      <textarea
                        className="form-control"
                        rows={6}
                        value={formData.noteContent}
                        onChange={(e) => setFormData({ ...formData, noteContent: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        value={formData.noteType}
                        onChange={(e) => setFormData({ ...formData, noteType: e.target.value as NoteType })}
                      >
                        {Object.values(NoteType).map(type => (
                          <option key={type} value={type}>
                            {NOTE_TYPE_CONFIG[type].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Color</label>
                      <div className="d-flex gap-2 flex-wrap">
                        {Object.values(NoteColor).map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`btn color-btn ${formData.color === color ? 'active' : ''}`}
                            style={{ 
                              backgroundColor: NOTE_COLOR_CONFIG[color]?.value || '#ffffff',
                              width: '30px',
                              height: '30px',
                              border: formData.color === color ? '2px solid #007bff' : '1px solid #dee2e6'
                            }}
                            onClick={() => setFormData({ ...formData, color })}
                            title={NOTE_COLOR_CONFIG[color].label}
                          ></button>
                        ))}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as NoteCategory })}
                      >
                        {Object.values(NoteCategory).map(category => (
                          <option key={category} value={category}>
                            {NOTE_CATEGORY_CONFIG[category].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as NotePriority })}
                      >
                        {Object.values(NotePriority).map(priority => (
                          <option key={priority} value={priority}>
                            {NOTE_PRIORITY_CONFIG[priority].label}
                          </option>
                        ))}
                      </select>
                    </div>


                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editing ? "Update Note" : "Create Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {showViewModal && viewingNote && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{viewingNote.noteTitle}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>Type:</strong>
                    <span className="badge bg-secondary ms-2">
                      <i className={`fa ${NOTE_TYPE_CONFIG[viewingNote.noteType].icon} me-1`}></i>
                      {NOTE_TYPE_CONFIG[viewingNote.noteType].label}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>Category:</strong>
                    <span className="badge bg-info ms-2">
                      <i className={`fa ${NOTE_CATEGORY_CONFIG[viewingNote.category].icon} me-1`}></i>
                      {NOTE_CATEGORY_CONFIG[viewingNote.category].label}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>Priority:</strong>
                    <span className={`badge ms-2 ${NOTE_PRIORITY_CONFIG[viewingNote.priority].badgeClass}`}>
                      <i className={`fa ${NOTE_PRIORITY_CONFIG[viewingNote.priority].icon} me-1`}></i>
                      {NOTE_PRIORITY_CONFIG[viewingNote.priority].label}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>Color:</strong>
                    <span 
                      className="badge ms-2"
                      style={{ 
                        backgroundColor: NOTE_COLOR_CONFIG[viewingNote.color]?.value || '#ffffff',
                        color: NOTE_COLOR_CONFIG[viewingNote.color]?.textColor || '#000000'
                      }}
                    >
                      {NOTE_COLOR_CONFIG[viewingNote.color].label}
                    </span>
                  </div>
                  <div className="col-12">
                    <strong>Content:</strong>
                    <div className="mt-2 p-3 bg-light rounded">
                      {viewingNote.noteContent}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Created:</strong>
                    <span className="ms-2">{formatDate(viewingNote.createdDate)}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>Last Modified:</strong>
                    <span className="ms-2">{formatDate(viewingNote.modifiedDate)}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowViewModal(false);
                    openEditNoteModal(viewingNote);
                  }}
                >
                  Edit Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingNote && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the note "{deletingNote.noteTitle}"?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Modal Backdrop */}
            {(showModal || showViewModal || showDeleteModal) && (
              <div className="modal-backdrop show"></div>
            )}
          </div> {/* End notes-main-content */}
        </div> {/* End col-lg-9 */}
      </div> {/* End row g-3 */}
    </div>
  );
};

export default UserNotes;
