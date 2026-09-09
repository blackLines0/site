"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnnouncement } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";

const DISMISS_KEY = "blacklines_banner_dismissed";
const REPEATS = 8;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function useCountdown(target: string | null) {
  const [remaining, setRemaining] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!target) {
      setRemaining(null);
      return;
    }

    const targetMs = new Date(target).getTime();

    function tick() {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setRemaining({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      setRemaining({
        d: Math.floor(totalSeconds / 86400),
        h: Math.floor((totalSeconds % 86400) / 3600),
        m: Math.floor((totalSeconds % 3600) / 60),
        s: totalSeconds % 60,
      });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return remaining;
}

export function AnnouncementBanner() {
  const { data: announcement } = useQuery({
    queryKey: queryKeys.announcement,
    queryFn: getAnnouncement,
  });
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const countdown = useCountdown(announcement?.dateFin ?? null);

  useEffect(() => {
    try {
      setDismissedId(window.localStorage.getItem(DISMISS_KEY));
    } catch {
      // localStorage unavailable — banner just won't remember dismissal
    }
  }, []);

  if (!announcement) return null;
  if (announcement.dateFin && new Date(announcement.dateFin).getTime() <= Date.now()) return null;
  if (announcement.id === dismissedId) return null;

  function dismiss() {
    if (!announcement) return;
    try {
      window.localStorage.setItem(DISMISS_KEY, announcement.id);
    } catch {
      // ignore — worst case the banner reappears next visit
    }
    setDismissedId(announcement.id);
  }

  return (
    <div className="announcement-bar">
      <div className="announcement-marquee">
        <div className="announcement-track">
          {[0, 1].map((half) => (
            <div className="announcement-half" key={half} aria-hidden={half === 1}>
              {Array.from({ length: REPEATS }, (_, i) => (
                <span className="announcement-item" key={i}>
                  {announcement.texte}
                  <span className="dot">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      {countdown ? (
        <div className="announcement-countdown">
          {pad(countdown.d)} Jrs : {pad(countdown.h)} Hrs : {pad(countdown.m)} Mins : {pad(countdown.s)} Secs
        </div>
      ) : null}
      <button className="announcement-close" onClick={dismiss} aria-label="Fermer la bannière">
        ×
      </button>
    </div>
  );
}
