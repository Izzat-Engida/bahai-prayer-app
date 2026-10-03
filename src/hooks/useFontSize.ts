import { useAppDispatch, useAppSelector } from "../store";
import {
  increaseFontScale,
  decreaseFontScale,
  resetFontScale,
  setFontScale,
} from "../store/slices/fontSizeSlice";

export const useFontSize = () => {
  const dispatch = useAppDispatch();
  const fontScale = useAppSelector((state) => state.fontSize.fontScale);

  return {
    fontScale,
    scaledSize: (base: number) => Math.round(base * fontScale),
    increaseFont: () => dispatch(increaseFontScale()),
    decreaseFont: () => dispatch(decreaseFontScale()),
    resetFont: () => dispatch(resetFontScale()),
    setFontScale: (scale: number) => dispatch(setFontScale(scale)),
  };
};

export default useFontSize;
