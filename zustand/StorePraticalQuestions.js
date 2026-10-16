import { create } from 'zustand';

export const UsePracticeStore = create((set) => ({
  practiceQuestions: [], 
  currentCourses: [],
  userAnswers: {},       
  startTime: null,

  setPracticeData: (allQuestions, courses) => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected20 = shuffled.slice(0, 20); // Set number of questions here

    set({ 
      practiceQuestions: selected20, 
      currentCourses: courses,
      userAnswers: {},
      startTime: Date.now()
    });
  },

  setUserAnswer: (questionId, optionIndex) => set((state) => ({
    userAnswers: {
      ...state.userAnswers,
      [questionId]: optionIndex
    }
  })),

  clearPracticeData: () => set({ 
    practiceQuestions: [], 
    currentCourses: [],
    userAnswers: {},
    startTime: null
  }),
}));