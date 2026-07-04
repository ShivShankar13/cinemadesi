import { create } from "zustand";

/**
 * Global search-palette open state. Lets any component in the tree
 * trigger the cmdk FilmSearch dialog without prop-drilling — the
 * navbar hosts the actual component, others just call `open()`.
 */
interface SearchPaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (next: boolean) => void;
}

export const useSearchPalette = create<SearchPaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (next) => set({ isOpen: next }),
}));
