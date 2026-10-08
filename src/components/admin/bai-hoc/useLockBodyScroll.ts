import { useEffect } from 'react';

export function useLockBodyScroll(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const mainElem = document.querySelector('main');
    const originalMainOverflow = mainElem ? mainElem.style.overflow : '';

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (mainElem) {
      mainElem.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (mainElem) {
        mainElem.style.overflow = originalMainOverflow;
      }
    };
  }, [isOpen]);
}
