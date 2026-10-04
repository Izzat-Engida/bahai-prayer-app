import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  useOnlineAudio: boolean;
  readingSpeed: number; // 0.5 to 2.0 (default 1.0)
}

const initialState: SettingsState = {
  useOnlineAudio: true,
  readingSpeed: 1.0,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setUseOnlineAudio: (state, action: PayloadAction<boolean>) => {
      state.useOnlineAudio = action.payload;
    },
    setReadingSpeed: (state, action: PayloadAction<number>) => {
      state.readingSpeed = Math.max(0.5, Math.min(2.0, action.payload));
    },
    resetSettings: (state) => {
      state.useOnlineAudio = true;
      state.readingSpeed = 1.0;
    },
  },
});

export const { setUseOnlineAudio, setReadingSpeed, resetSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;
