import { create } from "zustand";
import { AuthSlice, createAuthSlice, createScrapingSlice, ScrapingSlice } from "./slices";


type StoreState = AuthSlice & ScrapingSlice;

export const useAppStore = create<StoreState>()((...a) => ({
    ...createAuthSlice(...a),
    ...createScrapingSlice(...a),
}));



