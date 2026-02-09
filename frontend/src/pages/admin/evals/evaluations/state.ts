import { create } from 'zustand';
import type { GetAllEvaluationResult, EvaluationDetailSummary } from 'src/api/generated-eval';

type EvaluationsState = {
  // List of evaluations for the list page
  evaluations: GetAllEvaluationResult[];

  // Currently selected/viewed evaluation
  selectedEvaluation: EvaluationDetailSummary | null;

  // Total count for pagination
  totalCount: number;
};

type EvaluationsActions = {
  // Set all evaluations (from list fetch)
  setEvaluations: (evaluations: GetAllEvaluationResult[], totalCount?: number) => void;

  // Update a single evaluation in the list
  updateEvaluationInList: (evaluation: GetAllEvaluationResult) => void;

  // Remove an evaluation from the list
  removeEvaluationFromList: (id: string) => void;

  // Set the currently selected evaluation
  setSelectedEvaluation: (evaluation: EvaluationDetailSummary | null) => void;
};

const useEvaluationsStore_ = create<EvaluationsState & EvaluationsActions>()((set) => ({
  evaluations: [],
  selectedEvaluation: null,
  totalCount: 0,

  setEvaluations: (evaluations: GetAllEvaluationResult[], totalCount?: number) => {
    return set({ evaluations, totalCount: totalCount ?? evaluations.length });
  },

  updateEvaluationInList: (evaluation: GetAllEvaluationResult) => {
    return set((state) => {
      const evaluations = [...state.evaluations];
      const index = evaluations.findIndex((e) => e.id === evaluation.id);
      if (index >= 0) {
        evaluations[index] = evaluation;
      } else {
        evaluations.push(evaluation);
      }
      return { evaluations };
    });
  },

  removeEvaluationFromList: (id: string) => {
    return set((state) => ({
      evaluations: state.evaluations.filter((e) => e.id !== id),
      totalCount: Math.max(0, state.totalCount - 1),
    }));
  },

  setSelectedEvaluation: (evaluation: EvaluationDetailSummary | null) => {
    return set({ selectedEvaluation: evaluation });
  },
}));

/**
 * Zustand store for Evaluations state management.
 * Handles evaluation list, selected evaluation, and pagination.
 */
export const useEvaluationsStore = useEvaluationsStore_;
