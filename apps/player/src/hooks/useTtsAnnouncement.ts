'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTtsAnnouncementOptions {
  lang?: string;
}

export function useTtsAnnouncement(options?: UseTtsAnnouncementOptions) {
  const [enabled, setEnabled] = useState(false);
  const lastAnnouncedRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const announce = useCallback(
    (title: string, requestedBy: string) => {
      if (!enabled) return;

      const key = `${title}::${requestedBy}`;
      if (lastAnnouncedRef.current === key) return;
      lastAnnouncedRef.current = key;

      window.speechSynthesis?.cancel();

      const text = `Bài hát ${title}, yêu cầu bởi ${requestedBy}`;
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis?.getVoices() ?? [];
      const targetLang = options?.lang ?? 'vi-VN';
      const matched = voices.find((v) => v.lang.startsWith(targetLang));
      if (matched) {
        utterance.voice = matched;
        utterance.lang = matched.lang;
      } else {
        utterance.lang = targetLang;
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis?.speak(utterance);
    },
    [enabled, options?.lang],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      if (prev) window.speechSynthesis?.cancel();
      return !prev;
    });
  }, []);

  return { enabled, toggle, announce };
}
