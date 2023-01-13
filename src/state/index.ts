import { atom } from "recoil";
import { NAMESPACE } from "../helpers";

export const themeState = atom<string>({
  key: `${NAMESPACE}theme`,
  default: "darkTheme",
})