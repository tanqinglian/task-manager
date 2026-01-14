import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FlashNote, CreateFlashNoteDTO, UpdateFlashNoteDTO } from '../types';

interface FlashNoteState {
  notes: FlashNote[];
  selectedNoteId: string | null;

  // 操作方法
  addNote: (note: CreateFlashNoteDTO) => void;
  updateNote: (note: UpdateFlashNoteDTO) => void;
  deleteNote: (id: string) => void;
  setSelectedNoteId: (id: string | null) => void;
  getSelectedNote: () => FlashNote | null;
  togglePin: (id: string) => void;
  searchNotes: (query: string) => FlashNote[];
}

const STORAGE_KEY = 'flash_notes_storage';

export const useFlashNoteStore = create<FlashNoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      selectedNoteId: null,

      addNote: (noteDto) => {
        const newNote: FlashNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: noteDto.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: noteDto.tags,
          isPinned: false,
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
          selectedNoteId: newNote.id,
        }));
      },

      updateNote: (noteDto) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteDto.id
              ? {
                  ...note,
                  ...noteDto,
                  updatedAt: new Date().toISOString(),
                }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => {
          const newNotes = state.notes.filter((note) => note.id !== id);
          return {
            notes: newNotes,
            selectedNoteId:
              state.selectedNoteId === id ? (newNotes[0]?.id || null) : state.selectedNoteId,
          };
        });
      },

      setSelectedNoteId: (id) => {
        set({ selectedNoteId: id });
      },

      getSelectedNote: () => {
        const state = get();
        return state.notes.find((note) => note.id === state.selectedNoteId) || null;
      },

      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: !note.isPinned } : note
          ),
        }));
      },

      searchNotes: (query) => {
        const state = get();
        if (!query.trim()) return state.notes;

        const lowerQuery = query.toLowerCase();
        return state.notes.filter(
          (note) =>
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
