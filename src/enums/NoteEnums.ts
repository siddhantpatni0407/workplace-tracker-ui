// src/enums/NoteEnums.ts

export enum NoteType {
  TEXT = 'TEXT',
  CHECKLIST = 'CHECKLIST',
  DRAWING = 'DRAWING',
  VOICE = 'VOICE',
  IMAGE = 'IMAGE',
  LINK = 'LINK'
}

export enum NoteColor {
  DEFAULT = 'DEFAULT',
  YELLOW = 'YELLOW',
  ORANGE = 'ORANGE',
  RED = 'RED',
  PINK = 'PINK',
  PURPLE = 'PURPLE',
  BLUE = 'BLUE',
  TEAL = 'TEAL',
  GREEN = 'GREEN',
  BROWN = 'BROWN',
  GREY = 'GREY'
}

export enum NoteCategory {
  PERSONAL = 'PERSONAL',
  WORK = 'WORK',
  IDEAS = 'IDEAS',
  REMINDERS = 'REMINDERS',
  PROJECTS = 'PROJECTS',
  MEETING_NOTES = 'MEETING_NOTES',
  SHOPPING = 'SHOPPING',
  TRAVEL = 'TRAVEL',
  HEALTH = 'HEALTH',
  FINANCE = 'FINANCE',
  LEARNING = 'LEARNING',
  INSPIRATION = 'INSPIRATION'
}

export enum NotePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NoteStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
  PINNED = 'PINNED'
}

export enum NoteViewMode {
  LIST = 'LIST',
  GRID = 'GRID',
  COMPACT = 'COMPACT',
  MASONRY = 'MASONRY'
}

export enum NoteSortBy {
  CREATED_DATE = 'CREATED_DATE',
  MODIFIED_DATE = 'MODIFIED_DATE',
  TITLE = 'TITLE',
  PRIORITY = 'PRIORITY',
  COLOR = 'COLOR',
  CATEGORY = 'CATEGORY'
}

export enum NoteSortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

// UI Configuration for Note Types
export const NOTE_TYPE_CONFIG = {
  [NoteType.TEXT]: {
    label: 'Text Note',
    icon: 'fa-file-text',
    color: '#2196F3',
    description: 'Simple text note'
  },
  [NoteType.CHECKLIST]: {
    label: 'Checklist',
    icon: 'fa-check-square',
    color: '#4CAF50',
    description: 'Todo checklist note'
  },
  [NoteType.DRAWING]: {
    label: 'Drawing',
    icon: 'fa-paint-brush',
    color: '#FF9800',
    description: 'Hand-drawn note'
  },
  [NoteType.VOICE]: {
    label: 'Voice Note',
    icon: 'fa-microphone',
    color: '#9C27B0',
    description: 'Audio recording note'
  },
  [NoteType.IMAGE]: {
    label: 'Image Note',
    icon: 'fa-image',
    color: '#607D8B',
    description: 'Image with annotations'
  },
  [NoteType.LINK]: {
    label: 'Link Note',
    icon: 'fa-link',
    color: '#00BCD4',
    description: 'Website or resource link'
  }
};

// UI Configuration for Note Colors
export const NOTE_COLOR_CONFIG = {
  [NoteColor.DEFAULT]: {
    label: 'Default',
    value: '#FFFFFF',
    textColor: '#000000'
  },
  [NoteColor.YELLOW]: {
    label: 'Yellow',
    value: '#FFF9C4',
    textColor: '#F57F17'
  },
  [NoteColor.ORANGE]: {
    label: 'Orange',
    value: '#FFE0B2',
    textColor: '#E65100'
  },
  [NoteColor.RED]: {
    label: 'Red',
    value: '#FFCDD2',
    textColor: '#B71C1C'
  },
  [NoteColor.PINK]: {
    label: 'Pink',
    value: '#F8BBD9',
    textColor: '#880E4F'
  },
  [NoteColor.PURPLE]: {
    label: 'Purple',
    value: '#E1BEE7',
    textColor: '#4A148C'
  },
  [NoteColor.BLUE]: {
    label: 'Blue',
    value: '#BBDEFB',
    textColor: '#0D47A1'
  },
  [NoteColor.TEAL]: {
    label: 'Teal',
    value: '#B2DFDB',
    textColor: '#004D40'
  },
  [NoteColor.GREEN]: {
    label: 'Green',
    value: '#C8E6C9',
    textColor: '#1B5E20'
  },
  [NoteColor.BROWN]: {
    label: 'Brown',
    value: '#D7CCC8',
    textColor: '#3E2723'
  },
  [NoteColor.GREY]: {
    label: 'Grey',
    value: '#F5F5F5',
    textColor: '#212121'
  }
};

// UI Configuration for Note Categories
export const NOTE_CATEGORY_CONFIG = {
  [NoteCategory.PERSONAL]: {
    label: 'Personal',
    icon: 'fa-user',
    color: '#2196F3'
  },
  [NoteCategory.WORK]: {
    label: 'Work',
    icon: 'fa-briefcase',
    color: '#FF9800'
  },
  [NoteCategory.IDEAS]: {
    label: 'Ideas',
    icon: 'fa-lightbulb',
    color: '#FFEB3B'
  },
  [NoteCategory.REMINDERS]: {
    label: 'Reminders',
    icon: 'fa-bell',
    color: '#F44336'
  },
  [NoteCategory.PROJECTS]: {
    label: 'Projects',
    icon: 'fa-folder-open',
    color: '#9C27B0'
  },
  [NoteCategory.MEETING_NOTES]: {
    label: 'Meeting Notes',
    icon: 'fa-users',
    color: '#607D8B'
  },
  [NoteCategory.SHOPPING]: {
    label: 'Shopping',
    icon: 'fa-shopping-cart',
    color: '#4CAF50'
  },
  [NoteCategory.TRAVEL]: {
    label: 'Travel',
    icon: 'fa-plane',
    color: '#00BCD4'
  },
  [NoteCategory.HEALTH]: {
    label: 'Health',
    icon: 'fa-heart',
    color: '#E91E63'
  },
  [NoteCategory.FINANCE]: {
    label: 'Finance',
    icon: 'fa-dollar-sign',
    color: '#4CAF50'
  },
  [NoteCategory.LEARNING]: {
    label: 'Learning',
    icon: 'fa-graduation-cap',
    color: '#3F51B5'
  },
  [NoteCategory.INSPIRATION]: {
    label: 'Inspiration',
    icon: 'fa-star',
    color: '#FFC107'
  }
};

// UI Configuration for Note Priorities
export const NOTE_PRIORITY_CONFIG = {
  [NotePriority.LOW]: {
    label: 'Low',
    badgeClass: 'badge-success',
    color: '#4CAF50',
    icon: 'fa-arrow-down'
  },
  [NotePriority.MEDIUM]: {
    label: 'Medium',
    badgeClass: 'badge-warning',
    color: '#FF9800',
    icon: 'fa-minus'
  },
  [NotePriority.HIGH]: {
    label: 'High',
    badgeClass: 'badge-danger',
    color: '#F44336',
    icon: 'fa-arrow-up'
  },
  [NotePriority.URGENT]: {
    label: 'Urgent',
    badgeClass: 'badge-dark',
    color: '#9C27B0',
    icon: 'fa-exclamation-triangle'
  }
};

// UI Configuration for Note Status
export const NOTE_STATUS_CONFIG = {
  [NoteStatus.ACTIVE]: {
    label: 'Active',
    badgeClass: 'badge-primary',
    color: '#2196F3'
  },
  [NoteStatus.ARCHIVED]: {
    label: 'Archived',
    badgeClass: 'badge-secondary',
    color: '#607D8B'
  },
  [NoteStatus.DELETED]: {
    label: 'Deleted',
    badgeClass: 'badge-danger',
    color: '#F44336'
  },
  [NoteStatus.PINNED]: {
    label: 'Pinned',
    badgeClass: 'badge-warning',
    color: '#FF9800'
  }
};

// View Mode Configuration
export const NOTE_VIEW_MODE_CONFIG = {
  [NoteViewMode.LIST]: {
    label: 'List View',
    icon: 'fa-list',
    description: 'Linear list layout'
  },
  [NoteViewMode.GRID]: {
    label: 'Grid View',
    icon: 'fa-th',
    description: 'Grid card layout'
  },
  [NoteViewMode.COMPACT]: {
    label: 'Compact View',
    icon: 'fa-th-list',
    description: 'Compact list layout'
  },
  [NoteViewMode.MASONRY]: {
    label: 'Masonry View',
    icon: 'fa-th-large',
    description: 'Pinterest-style layout'
  }
};

// Sort Configuration
export const NOTE_SORT_CONFIG = {
  [NoteSortBy.CREATED_DATE]: {
    label: 'Created Date',
    icon: 'fa-calendar-plus'
  },
  [NoteSortBy.MODIFIED_DATE]: {
    label: 'Modified Date',
    icon: 'fa-calendar-check'
  },
  [NoteSortBy.TITLE]: {
    label: 'Title',
    icon: 'fa-sort-alpha-down'
  },
  [NotePriority.HIGH]: {
    label: 'Priority',
    icon: 'fa-exclamation'
  },
  [NoteSortBy.COLOR]: {
    label: 'Color',
    icon: 'fa-palette'
  },
  [NoteSortBy.CATEGORY]: {
    label: 'Category',
    icon: 'fa-tags'
  }
};