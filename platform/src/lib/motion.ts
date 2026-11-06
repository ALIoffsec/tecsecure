/**
 * Motion is a site setting, not the operating system's. Windows' "best performance" mode reports
 * reduced motion to browsers on many ordinary PCs, which silently removed every animation here, so
 * the site animates by default and anyone who wants less motion turns it off in the menu.
 */
export const MOTION_KEY = "tecsecure-motion";
const MOTION_EVENT = "tecsecure:motion";

export function motionOff(): boolean {
  return document.documentElement.dataset.motion === "off";
}

export function setMotionOff(off: boolean) {
  if (off) document.documentElement.dataset.motion = "off";
  else delete document.documentElement.dataset.motion;
  try {
    if (off) window.localStorage.setItem(MOTION_KEY, "off");
    else window.localStorage.removeItem(MOTION_KEY);
  } catch { /* the choice then lasts for this page view */ }
  window.dispatchEvent(new Event(MOTION_EVENT));
}

/** Shaped like a MediaQueryList, so callers read and subscribe the way they always did. */
export function motionPreference() {
  return {
    get matches() { return motionOff(); },
    addEventListener: (_type: "change", listener: () => void) => window.addEventListener(MOTION_EVENT, listener),
    removeEventListener: (_type: "change", listener: () => void) => window.removeEventListener(MOTION_EVENT, listener)
  };
}
