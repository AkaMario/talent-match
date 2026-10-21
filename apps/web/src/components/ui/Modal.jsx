import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ children, close, title }) {
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previous = document.activeElement;
    const el = document.querySelector('[role="dialog"]');
    const focusables = () =>
      el?.querySelectorAll(
        'button:not(:disabled),input,select,textarea,[tabindex="0"]',
      );
    focusables()?.[0]?.focus();
    function key(e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = focusables();
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#122a26a6] p-[25px] backdrop-blur-[5px] max-sm:p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="modal relative max-h-[90vh] w-[720px] max-w-full overflow-y-auto rounded-[18px] bg-white p-10 max-sm:max-h-[94vh] max-sm:rounded-[14px] max-sm:px-[22px] max-sm:py-8"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="modal-close icon-button"
          aria-label="Cerrar"
          onClick={close}
        >
          <X size={22} />
        </button>
        {children}
      </section>
    </div>
  );
}
