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
  const userId = ((user as any)?.userId ?? (user as any)?.id) as number | undefined;

  // State for notes and UI
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<NoteStatsResponse | null>(null);
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
    priority: NotePriority.MEDIUM,
    tags: []
  });

  const [currentTag, setCurrentTag] = useState<string>("");
  const formRef = useRef<HTMLInputElement | null>(null);

  // Load notes
  const loadNotes = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await noteService.getNotesByUser(userId);
      if (response.status === ApiStatus.SUCCESS) {
        setNotes(response.data);
      } else {
        toast.error(response.message || "Failed to load notes");
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load note statistics
  const loadStats = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await noteService.getNoteStats(userId);
      if (response.status === ApiStatus.SUCCESS) {
        setStats(response.data || null);
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
        note.noteContent.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
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
          noteId: editing.noteId,
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
      const response = await noteService.deleteNote(deletingNote.noteId);
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
      priority: NotePriority.MEDIUM,
      tags: []
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
      priority: note.priority,
      tags: [...note.tags]
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
      const filtered = prev.filter(n => n.noteId !== note.noteId);
      return [note, ...filtered].slice(0, 5);
    });
  };

  // Add tag to form
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag("");
    }
  };

  // Remove tag from form
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
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
      ...notes.flatMap(note => note.tags || []),
      ...notes.map(note => note.noteTitle),
      'meeting notes', 'project ideas', 'todo items', 'personal thoughts'
    ]
      .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, 5);

    setSearchSuggestions(suggestions);
    setShowSearchSuggestions(suggestions.length > 0);
  }, [notes]);

  const autoGenerateTags = useCallback((title: string, content: string): string[] => {
    const text = `${title} ${content}`.toLowerCase();
    const autoTags: string[] = [];

    const tagPatterns = {
      'meeting': /\b(meeting|agenda|discussion|attendees)\b/,
      'project': /\b(project|deadline|milestone|timeline)\b/,
      'idea': /\b(idea|concept|brainstorm|innovation)\b/,
      'todo': /\b(todo|task|action|complete)\b/,
      'urgent': /\b(urgent|asap|priority|important)\b/,
      'work': /\b(work|office|business|client)\b/,
      'personal': /\b(personal|family|home|private)\b/
    };

    Object.entries(tagPatterns).forEach(([tag, pattern]) => {
      if (pattern.test(text)) {
        autoTags.push(tag);
      }
    });

    return autoTags;
  }, []);

  // Enhanced search with smart suggestions
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    generateSearchSuggestions(query);
  }, [generateSearchSuggestions]);

  useEffect(() => {
    loadNotes();
    loadStats();
    
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
          category: NoteCategory.WORK,
          tags: ['meeting']
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
          category: NoteCategory.WORK,
          tags: ['project', 'planning']
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
          category: NoteCategory.PERSONAL,
          tags: ['idea', 'brainstorm']
        }
      }
    ];
    setNoteTemplates(defaultTemplates);
  }, [userId, loadNotes, loadStats, t]);

  if (!userId) {
    return (
      <div className="container-fluid py-3">
        <Header title={t('notes.title')} subtitle={t('notes.subtitle')} />
        <div className="alert alert-warning">{t('notes.pleaseLoginToViewNotes')}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <Header title={t('notes.title')} subtitle={t('notes.subtitle')} />

      {/* Statistics Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card stat-card text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">{stats.totalNotes}</h5>
                <p className="card-text">{t('notes.totalNotes')}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card text-center">
              <div className="card-body">
                <h5 className="card-title text-warning">{stats.pinnedNotes}</h5>
                <p className="card-text">{t('notes.pinnedNotes')}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card text-center">
              <div className="card-body">
                <h5 className="card-title text-info">{stats.sharedNotes}</h5>
                <p className="card-text">{t('notes.favoriteNotes')}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card text-center">
              <div className="card-body">
                <h5 className="card-title text-success">{stats.totalWordCount}</h5>
                <p className="card-text">{t('notes.totalWordCount')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions & Templates */}
      <div className="row mb-4">
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
                              priority: NotePriority.MEDIUM,
                              tags: autoGenerateTags('', target.value.trim())
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
                      key={note.noteId} 
                      className="recent-note-item"
                      onClick={() => handleViewNote(note)}
                    >
                      <div className="d-flex align-items-center">
                        <i className={`fa ${NOTE_TYPE_CONFIG[note.noteType].icon} me-2 text-primary`}></i>
                        <div className="flex-grow-1">
                          <div className="recent-note-title">{note.noteTitle}</div>
                          <small className="text-muted">{new Date(note.modifiedDate || note.createdDate).toLocaleDateString()}</small>
                        </div>
                        {favoriteNotes.includes(note.noteId) && (
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
                  <div key={note.noteId} className="col-md-4 mb-3">
                    <div 
                      className="card sticky-note shadow-sm"
                      style={{ 
                        backgroundColor: `${NOTE_COLOR_CONFIG[note.color].value}20`,
                        borderLeft: `4px solid ${NOTE_COLOR_CONFIG[note.color].value}`,
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
                            checked={selectedNotes.includes(note.noteId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotes([...selectedNotes, note.noteId]);
                              } else {
                                setSelectedNotes(selectedNotes.filter(id => id !== note.noteId));
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
      <div className="card mb-3 control-card shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-auto">
              <button className="btn btn-primary btn-sm" onClick={openNewNoteModal}>
                <i className="fa fa-plus me-2"></i>New Note
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
              <p>No notes found</p>
              <button className="btn btn-primary btn-sm" onClick={openNewNoteModal}>
                Create Your First Note
              </button>
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
                                setSelectedNotes(filteredNotes.map(n => n.noteId));
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
                        <tr key={note.noteId}>
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedNotes.includes(note.noteId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedNotes([...selectedNotes, note.noteId]);
                                } else {
                                  setSelectedNotes(selectedNotes.filter(id => id !== note.noteId));
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
                                {note.noteTitle}
                              </strong>
                              <small className="text-muted d-block">
                                {getNotePreview(note.noteContent, 50)}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              <i className={`fa ${NOTE_TYPE_CONFIG[note.noteType].icon} me-1`}></i>
                              {NOTE_TYPE_CONFIG[note.noteType].label}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              <i className={`fa ${NOTE_CATEGORY_CONFIG[note.category].icon} me-1`}></i>
                              {NOTE_CATEGORY_CONFIG[note.category].label}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${NOTE_PRIORITY_CONFIG[note.priority].badgeClass}`}>
                              <i className={`fa ${NOTE_PRIORITY_CONFIG[note.priority].icon} me-1`}></i>
                              {NOTE_PRIORITY_CONFIG[note.priority].label}
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
                                onClick={() => handleTogglePin(note.noteId)}
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
                      key={note.noteId} 
                      className={`${
                        viewMode === NoteViewMode.GRID ? 'col-md-4 col-lg-3' :
                        viewMode === NoteViewMode.COMPACT ? 'col-md-6 col-lg-4' :
                        'col-md-3 col-lg-2'
                      }`}
                    >
                      <div 
                        className={`card note-card h-100`}
                        style={{ 
                          backgroundColor: NOTE_COLOR_CONFIG[note.color].value,
                          color: NOTE_COLOR_CONFIG[note.color].textColor,
                          borderColor: NOTE_COLOR_CONFIG[note.color].value
                        }}
                      >
                        <div className="card-header border-0 p-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="card-title mb-1">
                                {note.isPinned && <i className="fa fa-thumbtack me-1 text-warning"></i>}
                                {favoriteNotes.includes(note.noteId) && <i className="fa fa-heart me-1 text-danger"></i>}
                                {note.noteTitle}
                              </h6>
                              <div className="d-flex gap-1">
                                <span className={`badge ${NOTE_PRIORITY_CONFIG[note.priority].badgeClass} badge-sm`}>
                                  {NOTE_PRIORITY_CONFIG[note.priority].label}
                                </span>
                                <span className="badge bg-secondary badge-sm">
                                  {NOTE_TYPE_CONFIG[note.noteType].label}
                                </span>
                              </div>
                            </div>
                            <div className="dropdown">
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                type="button" 
                                data-bs-toggle="dropdown"
                              >
                                <i className="fa fa-ellipsis-v"></i>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleViewNote(note)}
                                  >
                                    <i className="fa fa-eye me-2"></i>View
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => openEditNoteModal(note)}
                                  >
                                    <i className="fa fa-edit me-2"></i>Edit
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleTogglePin(note.noteId)}
                                  >
                                    <i className="fa fa-thumbtack me-2"></i>
                                    {note.isPinned ? "Unpin" : "Pin"}
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleToggleFavorite(note.noteId)}
                                  >
                                    <i className={`fa ${favoriteNotes.includes(note.noteId) ? 'fa-heart text-danger' : 'fa-heart-o'} me-2`}></i>
                                    {favoriteNotes.includes(note.noteId) ? "Remove from Favorites" : "Add to Favorites"}
                                  </button>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <button 
                                    className="dropdown-item text-danger"
                                    onClick={() => {
                                      setDeletingNote(note);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <i className="fa fa-trash me-2"></i>Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="card-body p-2">
                          <p className="card-text" style={{ fontSize: viewMode === NoteViewMode.COMPACT ? '0.85rem' : '0.9rem' }}>
                            {getNotePreview(note.noteContent, viewMode === NoteViewMode.MASONRY ? 200 : 100)}
                          </p>
                          {note.tags.length > 0 && (
                            <div className="mb-2">
                              {note.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="badge bg-light text-dark me-1 badge-sm">
                                  #{tag}
                                </span>
                              ))}
                              {note.tags.length > 3 && (
                                <span className="badge bg-light text-dark badge-sm">
                                  +{note.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="card-footer border-0 p-2">
                          <small className="text-muted">
                            <i className="fa fa-clock me-1"></i>
                            {formatDate(note.modifiedDate)}
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
                              backgroundColor: NOTE_COLOR_CONFIG[color].value,
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

                    <div className="col-12">
                      <label className="form-label">Tags</label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Add a tag..."
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={addTag}
                        >
                          Add
                        </button>
                      </div>
                      <div className="d-flex gap-1 flex-wrap">
                        {formData.tags.map(tag => (
                          <span key={tag} className="badge bg-primary">
                            #{tag}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-1"
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => removeTag(tag)}
                            ></button>
                          </span>
                        ))}
                      </div>
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
                        backgroundColor: NOTE_COLOR_CONFIG[viewingNote.color].value,
                        color: NOTE_COLOR_CONFIG[viewingNote.color].textColor
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
                  {viewingNote.tags.length > 0 && (
                    <div className="col-12">
                      <strong>Tags:</strong>
                      <div className="mt-2">
                        {viewingNote.tags.map(tag => (
                          <span key={tag} className="badge bg-primary me-1">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
    </div>
  );
};

export default UserNotes;
