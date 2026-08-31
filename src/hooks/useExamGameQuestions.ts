'use client';

import { useState, useEffect } from 'react';

export interface GameExamQuestion {
  id: string;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  subject: string;
  subjectSlug: string;
  examTitle: string;
  year: number;
  marks: number;
}

export function useExamGameQuestions(subjectSlug: string = 'all', limit: number = 30) {
  const [questions, setQuestions] = useState<GameExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/games/questions?subject=${encodeURIComponent(subjectSlug)}&limit=${limit}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.questions && data.questions.length > 0) {
        // Randomize option order for games so options aren't always in identical positions
        const randomized = data.questions.map((item: any) => {
          const originalOptions = [...item.options];
          const correctText = originalOptions[item.correct] || originalOptions[0];

          // Shuffle options
          const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
          const newCorrectIdx = shuffledOptions.indexOf(correctText);

          return {
            ...item,
            options: shuffledOptions,
            correct: newCorrectIdx >= 0 ? newCorrectIdx : 0,
          };
        });

        setQuestions(randomized);
      } else {
        setQuestions([]);
      }
    } catch (e: any) {
      console.error('Failed to load exam questions for game:', e);
      setError('فشل تحميل أسئلة الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subjectSlug, limit]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
  };
}
