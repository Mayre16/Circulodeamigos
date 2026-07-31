"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CmsDocument } from "@/lib/cms/types";
import { isCmsEditOrigin, type CmsEditMessage } from "@/lib/cms/edit-bridge";
import {
  EARLY_CMS_PUBLISHED_KEY,
  type EarlyCmsPublishedSlot,
} from "@/lib/cms/early-published-bootstrap";
import circuloPublishedSnapshot from "@/data/circulodeamigos/published.json";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
const CMS_SITE = "circulodeamigos";

const CmsContext = createContext<CmsDocument | null>(null);

function snapshotPublished(): CmsDocument | null {
  const doc = circuloPublishedSnapshot as CmsDocument;
  if (doc && typeof doc === "object" && doc.version === 1) return doc;
  return null;
}

const BUNDLED_PUBLISHED = snapshotPublished();

function earlySlot(): EarlyCmsPublishedSlot | undefined {
  if (typeof window === "undefined") return undefined;
  return window[EARLY_CMS_PUBLISHED_KEY as "__circuloCmsPublished"];
}

function earlyPublishedPromise(): Promise<CmsDocument | null> | null {
  const p = earlySlot()?.promise;
  if (!p || typeof p.then !== "function") return null;
  return p.then((data) => {
    if (
      data &&
      typeof data === "object" &&
      ((data as CmsDocument).site === CMS_SITE ||
        (data as CmsDocument).version === 1)
    ) {
      return data as CmsDocument;
    }
    return null;
  });
}

function isNewerPublished(next: CmsDocument, current: CmsDocument | null): boolean {
  if (!current?.updatedAt) return true;
  if (!next.updatedAt) return true;
  return next.updatedAt >= current.updatedAt;
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<CmsDocument | null>(() => BUNDLED_PUBLISHED);

  const loadPublished = useCallback(() => {
    if (!CMS_URL) return;
    const apply = (data: CmsDocument | null) => {
      if (!data) return;
      if (data.site === CMS_SITE || data.version === 1) {
        setDoc((prev) => (isNewerPublished(data, prev) ? data : prev));
      }
    };
    const early = earlyPublishedPromise();
    if (early) {
      early.then(apply).catch(() => {});
      return;
    }
    fetch(`${CMS_URL}/content/${CMS_SITE}/published`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CmsDocument | null) => apply(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const run = () => loadPublished();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(run, 150);
    return () => clearTimeout(t);
  }, [loadPublished]);

  useEffect(() => {
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      if (ev.data?.type === "cms-published") loadPublished();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [loadPublished]);

  return <CmsContext.Provider value={doc}>{children}</CmsContext.Provider>;
}

export function useCmsDocument() {
  return useContext(CmsContext);
}

export function isCmsEnabled() {
  return Boolean(CMS_URL);
}
