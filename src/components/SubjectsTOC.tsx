"use client";
import { useEffect } from "react";

export default function SubjectsTOC() {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll('aside nav a')) as HTMLAnchorElement[];
    const sections = links.map((l) => document.querySelector(l.getAttribute('href')!));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('id');
          if (!id) return;
          const link = document.querySelector(`aside nav a[href="#${id}"]`);
          if (!link) return;
          if (entry.isIntersecting) {
            link.classList.add('text-indigo-600', 'font-semibold');
          } else {
            link.classList.remove('text-indigo-600', 'font-semibold');
          }
        });
      },
      { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((s) => s && observer.observe(s));

    return () => observer.disconnect();
  }, []);

  return null;
}
