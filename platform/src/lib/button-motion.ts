import { logoutButtonStates } from "./logout-animation-states";

export type ButtonMotion = { ready: Promise<void>; complete: () => Promise<void>; cancel: () => void };

function timeline(button: HTMLButtonElement) {
  const animations: Animation[] = [];
  const waits = new Map<ReturnType<typeof setTimeout>, () => void>();
  let cancelled = false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms: number) => new Promise<void>(resolve => {
    if (cancelled || reduced) { resolve(); return; }
    const id = setTimeout(() => { waits.delete(id); resolve(); }, ms);
    waits.set(id, resolve);
  });
  const animate = (element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    if (!reduced) animations.push(element.animate(frames, { ...options, fill: "forwards" }));
  };
  const cancel = () => {
    cancelled = true;
    animations.forEach(animation => animation.cancel());
    waits.forEach((resolve, id) => { clearTimeout(id); resolve(); });
    waits.clear();
    button.classList.remove("animation", "done", "clicked", "door-slammed", "falling");
    button.removeAttribute("data-animation-stage");
    button.style.removeProperty("--truck-y");
    button.style.removeProperty("--truck-y-n");
    button.querySelector<HTMLElement>(".box")?.style.removeProperty("transform");
  };
  return { wait, animate, cancel, reduced, get cancelled() { return cancelled; } };
}

export function startOrderMotion(button: HTMLButtonElement): ButtonMotion {
  const motion = timeline(button);
  const truck = button.querySelector(".truck");
  const box = button.querySelector<HTMLElement>(".box");
  if (!truck || !box) throw new Error("Original order artwork is missing");
  if (!motion.reduced) {
    button.classList.add("animation");
    button.dataset.animationStage = "loading";
    button.style.setProperty("--truck-y", "0");
    button.style.setProperty("--truck-y-n", "-26");
    box.style.transform = "none";
    const ease = "cubic-bezier(.333333,.666667,.666667,1)";
    motion.animate(box, [{ scale: ".5", opacity: 0 }, { scale: "1", opacity: 1 }], { duration: 300, delay: 500, easing: ease });
    motion.animate(box, [
      { translate: "-24px -6px", offset: 0 },
      { translate: "-24px -6px", offset: .56, easing: ease },
      { translate: "0px -6px", offset: .88 },
      { translate: "0px -6px", offset: .92, easing: ease },
      { translate: "0px 0px", offset: 1 }
    ], { duration: 1250 });
    motion.animate(box, [{ backgroundPositionX: "0%" }, { backgroundPositionX: "50%" }], { duration: 180, delay: 920, easing: ease });
    motion.animate(box, [{ transform: "translateX(0px)" }, { transform: "translateX(-5px)" }], { duration: 180, delay: 920, easing: ease, pseudoElement: "::after" });
    motion.animate(truck, [
      { transform: "rotateX(90deg) translate3d(4px, -26px, 12px)", offset: 0, easing: ease },
      { transform: "rotateX(90deg) translate3d(4px, -25px, 12px)", offset: 200 / 2600, easing: ease },
      { transform: "rotateX(90deg) translate3d(0px, -25px, 12px)", offset: 600 / 2600, easing: ease },
      { transform: "rotateX(90deg) translate3d(40px, -25px, 12px)", offset: 1600 / 2600, easing: ease },
      { transform: "rotateX(90deg) translate3d(20px, -25px, 12px)", offset: 2200 / 2600, easing: ease },
      { transform: `rotateX(90deg) translate3d(${Math.max(96, button.offsetWidth - 76)}px, -25px, 12px)`, offset: 1 }
    ], { duration: 2600, delay: 1250 });
    motion.animate(button, [{ transform: "rotateX(90deg) scaleX(0)" }, { transform: "rotateX(90deg) scaleX(1)" }], { duration: 2400, delay: 1450, easing: "cubic-bezier(.333333,0,.666667,0)", pseudoElement: "::after" });
  }
  const ready = motion.wait(3850).then(() => { if (!motion.cancelled) button.dataset.animationStage = "awaiting-response"; });
  return {
    ready, cancel: motion.cancel,
    complete: async () => {
      await ready;
      if (motion.cancelled) return;
      button.classList.add("animation", "done");
      button.dataset.animationStage = "success";
      await motion.wait(950);
    }
  };
}

export function setLogoutPose(button: HTMLButtonElement, pose: string) {
  for (const [name, value] of Object.entries(logoutButtonStates[pose])) button.style.setProperty(name, value);
}

export function startLogoutMotion(button: HTMLButtonElement): ButtonMotion {
  const motion = timeline(button);
  const ready = (async () => {
    if (motion.reduced) return;
    button.classList.add("clicked");
    setLogoutPose(button, "walking1");
    button.dataset.animationStage = "walking1";
    await motion.wait(300);
    if (motion.cancelled) return;
    button.classList.add("door-slammed");
    setLogoutPose(button, "walking2");
    button.dataset.animationStage = "walking2";
    await motion.wait(400);
    if (motion.cancelled) return;
    button.classList.add("falling");
    setLogoutPose(button, "falling1");
    button.dataset.animationStage = "falling1";
    await motion.wait(400);
    if (motion.cancelled) return;
    setLogoutPose(button, "falling2");
    await motion.wait(300);
    if (motion.cancelled) return;
    setLogoutPose(button, "falling3");
    await motion.wait(1000);
  })();
  return { ready, complete: () => ready, cancel: () => { motion.cancel(); setLogoutPose(button, "default"); } };
}
