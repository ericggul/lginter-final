import { useEffect, useState } from 'react';

export default function useTypewriter(text) {
  const [typedReason, setTypedReason] = useState('');
  const [showReason, setShowReason] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!text) {
      setIsDone(false);
      return;
    }

    setShowReason(true);
    setTypedReason('');
    setShowHighlights(false);
    setShowResults(false);
    setIsDone(false);

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setTypedReason(text.slice(0, index + 1));
        index += 1;
      } else {
        clearInterval(typingInterval);
        setIsDone(true);
        setTimeout(() => {
          setShowHighlights(true);
          setTimeout(() => {
            setShowResults(true);
          }, 4000);
        }, 500);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [text]);

  return { typedReason, showReason, showHighlights, showResults, isDone };
}
