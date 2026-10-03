import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FontSizeState {
  fontScale: number;
}

const initialState: FontSizeState = {
  fontScale: 1.0,
};

export const fontSizeSlice = createSlice({
  name: "fontSize",
  initialState,
  reducers: {
    increaseFontScale: (state) => {
      state.fontScale = Math.min(
        1.5,
        Math.round((state.fontScale + 0.1) * 100) / 100
      );
    },
    decreaseFontScale: (state) => {
      state.fontScale = Math.max(
        0.8,
        Math.round((state.fontScale - 0.1) * 100) / 100
      );
    },
    setFontScale: (state, action: PayloadAction<number>) => {
      state.fontScale = Math.max(
        0.8,
        Math.min(1.5, Math.round(action.payload * 100) / 100)
      );
    },
    resetFontScale: (state) => {
      state.fontScale = 1.0;
    },
  },
});

export const {
  increaseFontScale,
  decreaseFontScale,
  setFontScale,
  resetFontScale,
} = fontSizeSlice.actions;

export default fontSizeSlice.reducer;
