import { create } from "zustand";

const useSavedStore = create((set) => ({
  savedProperties: [],

  setSavedProperties: (data) => set({ savedProperties: data }),

  addSavedProperty: (propertyId) =>
    set((state) => ({
      savedProperties: [...state.savedProperties, propertyId],
    })),

  removeSavedProperty: (propertyId) =>
    set((state) => ({
      savedProperties: state.savedProperties.filter((id) => id !== propertyId),
    })),
}));

export default useSavedStore;
