import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

const VIEWPORT_GAP = 8;
const LAYER_GAP = 6;

export function useFloatingLayer({
  anchorRef,
  layerRef,
  open,
  align = "start",
  minWidth,
  onClose,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  layerRef: RefObject<HTMLElement | null>;
  open: boolean;
  align?: "start" | "end";
  minWidth?: number;
  onClose: () => void;
}) {
  const [style, setStyle] = useState<CSSProperties>({
    position: "fixed",
    top: 0,
    left: 0,
    visibility: "hidden",
  });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const anchorRect = anchor.getBoundingClientRect();
    const layerRect = layerRef.current?.getBoundingClientRect();
    const width = Math.max(minWidth ?? 0, anchorRect.width, layerRect?.width ?? 0);
    const height = layerRect?.height ?? 0;
    const maxWidth = Math.max(0, window.innerWidth - (VIEWPORT_GAP * 2));
    const resolvedWidth = Math.min(width, maxWidth);
    const desiredLeft = align === "end" ? anchorRect.right - resolvedWidth : anchorRect.left;
    const left = Math.min(
      Math.max(VIEWPORT_GAP, desiredLeft),
      Math.max(VIEWPORT_GAP, window.innerWidth - resolvedWidth - VIEWPORT_GAP),
    );

    const below = anchorRect.bottom + LAYER_GAP;
    const roomBelow = window.innerHeight - below - VIEWPORT_GAP;
    const roomAbove = anchorRect.top - LAYER_GAP - VIEWPORT_GAP;
    const shouldOpenAbove = height > roomBelow && roomAbove > roomBelow;
    const top = shouldOpenAbove
      ? Math.max(VIEWPORT_GAP, anchorRect.top - height - LAYER_GAP)
      : below;

    setStyle({
      position: "fixed",
      top,
      left,
      minWidth: Math.min(Math.max(minWidth ?? 0, anchorRect.width), maxWidth),
      maxWidth,
      maxHeight: Math.max(96, shouldOpenAbove ? roomAbove : roomBelow),
      visibility: "visible",
    });
  }, [align, anchorRef, layerRef, minWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target) && !layerRef.current?.contains(target)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onClose();
      anchorRef.current?.focus();
    };

    window.addEventListener("resize", updatePosition);
    document.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, layerRef, onClose, open, updatePosition]);

  return style;
}
