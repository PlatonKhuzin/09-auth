"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, MouseEvent } from "react";
import { createPortal } from "react-dom";
import css from "./Modal.module.css";
interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}
export default function Modal({ children, onClose }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    const selector = 'input, textarea, select, button, [tabindex="0"]';
    modalRef.current?.querySelector<HTMLElement>(selector)?.focus();
    function keydown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const elements = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(selector) ?? [],
      ).filter((el) => !(el instanceof HTMLButtonElement && el.disabled));
      const first = elements[0],
        last = elements[elements.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose, mounted]);
  function backdrop(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) onClose();
  }
  if (!mounted) return null;
  return createPortal(
    <div
      className={css.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Note dialog"
      onClick={backdrop}
    >
      <div className={css.modal} ref={modalRef}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
