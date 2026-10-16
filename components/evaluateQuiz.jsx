// Shared scoring logic used by the Result screen and the Review screen,
// so both always show the same numbers.

// Finds the index of the correct option, whatever format the JSON uses:
//   answer: 2        (index)
//   answer: "C"      (letter)
//   answer: "Text"   (the option text itself)
export function correctIndexOf(q) {
  const raw = q.answer ?? q.correctAnswer ?? 0;

  if (typeof raw === "number") return raw;

  if (typeof raw === "string") {
    const t = raw.trim();
    if (/^[A-Za-z]$/.test(t)) return t.toUpperCase().charCodeAt(0) - 65;
    const byText = (q.options || []).findIndex((o) => String(o).trim() === t);
    if (byText >= 0) return byText;
    const n = Number(t);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

export function evaluateQuiz(questions = [], answers = {}) {
  const items = questions.map((q, i) => {
    const userIndex = answers[q.id];
    const correctIndex = correctIndexOf(q);
    const answered = userIndex !== undefined && userIndex !== null;
    const isCorrect = answered && userIndex === correctIndex;

    return {
      ...q,
      number: i + 1,
      userIndex: answered ? userIndex : null,
      correctIndex,
      answered,
      isCorrect,
      status: isCorrect ? "correct" : answered ? "wrong" : "skipped",
    };
  });

  const total = items.length;
  const correct = items.filter((i) => i.status === "correct").length;
  const wrong = items.filter((i) => i.status === "wrong").length;
  const skipped = items.filter((i) => i.status === "skipped").length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { items, total, correct, wrong, skipped, percentage, passed: percentage >= 50 };
}