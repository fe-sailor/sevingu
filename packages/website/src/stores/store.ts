import { create } from 'zustand';

interface SevinguState {}

export const useStore = create<SevinguState>(() => ({}));
