"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { useLearningCatalog } from "@/components/learning-catalog-context";
import { learningUi } from "@/lib/learning-ui";
import type { LearningModule, LearningPath, Localized } from "@/lib/learning-demo";
import type { LearningModulePreview } from "@/lib/learning-catalog-types";

const storageKey = "tecsecure-learning-demo-v1";
const sectionId = (moduleSlug: string, index: number) => `${moduleSlug}:${index}`;

export type LearningPurchase = {
  moduleSlug: string;
  sectionIndex: number | null;
  purchaseKey: string;
  priceTec: number;
};

type LearningPurchaseState = {
  loaded: boolean;
  authenticated: boolean;
  tecBalance: number;
  purchases: LearningPurchase[];
  subscriptionAccess: boolean;
  error: string;
  notice: string;
};

export function useLearningText() {
  const { locale } = useSitePreferences();
  return { locale, tx: learningUi[locale], pick: (value: Localized) => value[locale] };
}

export function useLearningPurchases(moduleSlug: string) {
  const { tx } = useLearningText();
  const [state, setState] = useState<LearningPurchaseState>({
    loaded: false, authenticated: false, tecBalance: 0, purchases: [], subscriptionAccess: false, error: "", notice: ""
  });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/learning/purchases?module=${encodeURIComponent(moduleSlug)}`, { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) {
        setState((current) => ({ ...current, loaded: true, authenticated: false, error: "" }));
        return;
      }
      if (!response.ok) throw new Error(result.error ?? "TEC balansini yuklab bo‘lmadi.");
      setState((current) => ({
        ...current,
        loaded: true,
        authenticated: true,
        tecBalance: result.tecBalance,
        purchases: result.purchases,
        subscriptionAccess: Boolean(result.subscriptionAccess),
        error: ""
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        loaded: true,
        error: error instanceof Error ? error.message : "TEC balansini yuklab bo‘lmadi."
      }));
    }
  }, [moduleSlug]);

  useEffect(() => { void refresh(); }, [refresh]);

  const purchase = useCallback(async (kind: "MODULE" | "SECTION", sectionIndex?: number) => {
    setState((current) => ({ ...current, error: "", notice: "" }));
    try {
      const response = await fetch("/api/learning/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, moduleSlug, ...(kind === "SECTION" ? { sectionIndex } : {}) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Xaridni amalga oshirib bo‘lmadi.");
      if (result.purchase) {
        setState((current) => ({
          ...current,
          tecBalance: result.tecBalance,
          purchases: [...current.purchases, result.purchase],
          notice: "Material ochildi."
        }));
      } else {
        await refresh();
        setState((current) => ({
          ...current,
          subscriptionAccess: Boolean(result.subscriptionAccess) || current.subscriptionAccess,
          notice: result.subscriptionAccess ? tx.subscriptionAccessNotice : tx.alreadyUnlocked
        }));
      }
      return true;
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Xaridni amalga oshirib bo‘lmadi."
      }));
      return false;
    }
  }, [moduleSlug, refresh, tx]);

  return { ...state, purchase };
}

export function useLearningProgress() {
  const catalog = useLearningCatalog();
  const [done, setDone] = useState<string[]>([]);
  const [last, setLast] = useState<string | null>(null);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [earnedTec, setEarnedTec] = useState(0);
  const [rewardsAvailable, setRewardsAvailable] = useState(false);
  const [rewardNotice, setRewardNotice] = useState("");
  const [rewardError, setRewardError] = useState("");
  const serverRewardsAvailable = useRef<Promise<boolean>>(Promise.resolve(false));
  const { tx } = useLearningText();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (saved && Array.isArray(saved.done)) setDone(saved.done.filter((item: unknown) => typeof item === "string"));
      if (saved && typeof saved.last === "string") setLast(saved.last);
      if (saved && Array.isArray(saved.paths)) {
        const migratedPaths: string[] = saved.paths.flatMap((entry: unknown): string[] => {
          if (typeof entry === "string" && catalog.paths.some((path) => path.slug === entry)) return [entry];
          if (!entry || typeof entry !== "object") return [];
          const modules = (entry as { modules?: unknown }).modules;
          if (!Array.isArray(modules) || !modules.every((slug): slug is string => typeof slug === "string")) return [];
          const matchingPath = catalog.paths.find((path) =>
            path.modules.length === modules.length && path.modules.every((slug, index) => slug === modules[index]));
          return matchingPath ? [matchingPath.slug] : [];
        });
        setSelectedPaths([...new Set(migratedPaths)]);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    setReady(true);
  }, [catalog.modules, catalog.paths]);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify({ done, last, paths: selectedPaths }));
  }, [done, last, selectedPaths, ready]);

  useEffect(() => {
    if (!ready) return;
    let current = true;
    const request = fetch("/api/learning/progress", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? tx.purchaseFailed);
        if (!current) return false;
        const serverDone = (result.completedSections as { moduleSlug: string; sectionIndex: number }[])
          .map((item) => sectionId(item.moduleSlug, item.sectionIndex));
        if (result.rewardsAvailable === true) setDone(serverDone);
        else setDone((saved) => [...new Set([...saved, ...serverDone])]);
        setEarnedTec(result.earnedTec);
        setRewardsAvailable(result.rewardsAvailable === true);
        return result.rewardsAvailable === true;
      })
      .catch((error: unknown) => {
        if (current) setRewardError(error instanceof Error ? error.message : tx.purchaseFailed);
        return false;
      });
    serverRewardsAvailable.current = request;
    return () => { current = false; };
  }, [ready, tx.purchaseFailed]);

  const doneSet = useMemo(() => new Set(done), [done]);
  const isDone = useCallback((slug: string, index: number) => doneSet.has(sectionId(slug, index)), [doneSet]);
  const complete = useCallback(async (slug: string, index: number, answer?: string) => {
    setRewardNotice("");
    const available = await serverRewardsAvailable.current;
    if (!available) {
      setDone((current) => current.includes(sectionId(slug, index)) ? current : [...current, sectionId(slug, index)]);
      setLast(slug);
      return true;
    }

    try {
      const response = await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleSlug: slug, sectionIndex: index, ...(answer ? { answer } : {}) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? tx.purchaseFailed);
      setDone((current) => current.includes(sectionId(slug, index)) ? current : [...current, sectionId(slug, index)]);
      setLast(slug);
      if (result.rewardTec > 0) {
        setEarnedTec((current) => current + result.rewardTec);
        setRewardNotice(tx.rewardNotice.replace("{amount}", String(result.rewardTec)));
      }
      setRewardError("");
      return true;
    } catch (error) {
      setRewardError(error instanceof Error ? error.message : tx.purchaseFailed);
      return false;
    }
  }, [tx.purchaseFailed, tx.rewardNotice]);
  const touch = useCallback((slug: string) => setLast(slug), []);
  const reset = useCallback(() => {
    setDone([]);
    setLast(null);
    setRewardError("");
    void serverRewardsAvailable.current.then(async (available) => {
      if (!available) return;
      try {
        const response = await fetch("/api/learning/progress", { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? tx.purchaseFailed);
      } catch (error) {
        setRewardError(error instanceof Error ? error.message : tx.purchaseFailed);
      }
    });
  }, [tx.purchaseFailed]);
  const togglePath = useCallback((slug: string) => {
    if (!catalog.paths.some((path) => path.slug === slug)) return;
    setSelectedPaths((current) => current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [slug, ...current]);
  }, [catalog.paths]);

  const moduleProgress = useCallback((module: Pick<LearningModulePreview, "slug" | "sections">) => {
    const count = module.sections.filter((_, index) => doneSet.has(sectionId(module.slug, index))).length;
    return { done: count, total: module.sections.length, percent: Math.round((count / module.sections.length) * 100) };
  }, [doneSet]);

  const pathProgress = useCallback((path: LearningPath) => {
    const modules = path.modules.map((slug) => catalog.modules.find((item) => item.slug === slug)).filter((item): item is LearningModulePreview => Boolean(item));
    const total = modules.reduce((sum, item) => sum + item.sections.length, 0);
    const count = modules.reduce((sum, item) => sum + moduleProgress(item).done, 0);
    return { done: count, total, percent: total ? Math.round((count / total) * 100) : 0 };
  }, [catalog.modules, moduleProgress]);
  const myPaths = useMemo(
    () => selectedPaths.map((slug) => catalog.paths.find((path) => path.slug === slug)).filter((path): path is LearningPath => Boolean(path)),
    [catalog.paths, selectedPaths]
  );

  return { ready, last, isDone, complete, touch, reset, moduleProgress, pathProgress, selectedPaths, togglePath, myPaths, earnedTec, rewardsAvailable, rewardNotice, rewardError, doneCount: done.length };
}

export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="learn-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

export function TecAmount({ amount }: { amount: number }) {
  return (
    <span className="learn-tec-amount">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.5 21 7.7v8.6L12 21.5 3 16.3V7.7L12 2.5Z" />
        <path d="M8 8.5h8M12 8.5v7" />
      </svg>
      <strong>{amount}</strong> TEC
    </span>
  );
}
