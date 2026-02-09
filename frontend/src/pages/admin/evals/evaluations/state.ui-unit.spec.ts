import { describe, it, expect, beforeEach } from 'vitest';
import { useEvaluationsStore } from './state';
import type { GetAllEvaluationResult, EvaluationDetailSummary } from 'src/api/generated-eval';

describe('useEvaluationsStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useEvaluationsStore.setState({
      evaluations: [],
      selectedEvaluation: null,
      totalCount: 0,
    });
  });

  describe('setEvaluations', () => {
    it('should set evaluations and totalCount', () => {
      const mockEvaluations: GetAllEvaluationResult[] = [
        {
          id: '1',
          name: 'Test Evaluation',
          createdAt: new Date('2024-01-01'),
          catalog: null,
          metricResults: [],
          status: 'PENDING' as any,
          testCaseProgress: { done: 0, total: 10 },
          version: 1,
        },
      ];

      useEvaluationsStore.getState().setEvaluations(mockEvaluations, 1);

      const state = useEvaluationsStore.getState();
      expect(state.evaluations).toEqual(mockEvaluations);
      expect(state.totalCount).toBe(1);
    });

    it('should default totalCount to array length if not provided', () => {
      const mockEvaluations: GetAllEvaluationResult[] = [
        {
          id: '1',
          name: 'Test 1',
          createdAt: new Date(),
          catalog: null,
          metricResults: [],
          status: 'PENDING' as any,
          testCaseProgress: { done: 0, total: 10 },
          version: 1,
        },
        {
          id: '2',
          name: 'Test 2',
          createdAt: new Date(),
          catalog: null,
          metricResults: [],
          status: 'RUNNING' as any,
          testCaseProgress: { done: 5, total: 10 },
          version: 1,
        },
      ];

      useEvaluationsStore.getState().setEvaluations(mockEvaluations);

      const state = useEvaluationsStore.getState();
      expect(state.totalCount).toBe(2);
    });
  });

  describe('updateEvaluationInList', () => {
    it('should update existing evaluation in list', () => {
      const initialEvaluation: GetAllEvaluationResult = {
        id: '1',
        name: 'Initial Name',
        createdAt: new Date('2024-01-01'),
        catalog: null,
        metricResults: [],
        status: 'PENDING' as any,
        testCaseProgress: { done: 0, total: 10 },
        version: 1,
      };

      useEvaluationsStore.getState().setEvaluations([initialEvaluation]);

      const updatedEvaluation: GetAllEvaluationResult = {
        ...initialEvaluation,
        name: 'Updated Name',
        status: 'RUNNING' as any,
      };

      useEvaluationsStore.getState().updateEvaluationInList(updatedEvaluation);

      const state = useEvaluationsStore.getState();
      expect(state.evaluations[0].name).toBe('Updated Name');
      expect(state.evaluations[0].status).toBe('RUNNING');
    });

    it('should add evaluation if not found in list', () => {
      const evaluation: GetAllEvaluationResult = {
        id: '1',
        name: 'New Evaluation',
        createdAt: new Date(),
        catalog: null,
        metricResults: [],
        status: 'PENDING' as any,
        testCaseProgress: { done: 0, total: 10 },
        version: 1,
      };

      useEvaluationsStore.getState().updateEvaluationInList(evaluation);

      const state = useEvaluationsStore.getState();
      expect(state.evaluations).toHaveLength(1);
      expect(state.evaluations[0]).toEqual(evaluation);
    });
  });

  describe('removeEvaluationFromList', () => {
    it('should remove evaluation from list and decrement totalCount', () => {
      const evaluations: GetAllEvaluationResult[] = [
        {
          id: '1',
          name: 'Test 1',
          createdAt: new Date(),
          catalog: null,
          metricResults: [],
          status: 'PENDING' as any,
          testCaseProgress: { done: 0, total: 10 },
          version: 1,
        },
        {
          id: '2',
          name: 'Test 2',
          createdAt: new Date(),
          catalog: null,
          metricResults: [],
          status: 'RUNNING' as any,
          testCaseProgress: { done: 5, total: 10 },
          version: 1,
        },
      ];

      useEvaluationsStore.getState().setEvaluations(evaluations, 2);
      useEvaluationsStore.getState().removeEvaluationFromList('1');

      const state = useEvaluationsStore.getState();
      expect(state.evaluations).toHaveLength(1);
      expect(state.evaluations[0].id).toBe('2');
      expect(state.totalCount).toBe(1);
    });

    it('should not go below 0 for totalCount', () => {
      useEvaluationsStore.getState().setEvaluations([], 0);
      useEvaluationsStore.getState().removeEvaluationFromList('non-existent');

      const state = useEvaluationsStore.getState();
      expect(state.totalCount).toBe(0);
    });
  });

  describe('setSelectedEvaluation', () => {
    it('should set the selected evaluation', () => {
      const mockSummary: EvaluationDetailSummary = {
        id: '1',
        name: 'Test Evaluation',
        createdAt: new Date(),
        qaCatalog: null,
        metrics: [],
        metricResults: [],
        metricScores: [],
        status: 'SUCCESS' as any,
        testCaseProgress: { done: 10, total: 10 },
        version: 1,
      };

      useEvaluationsStore.getState().setSelectedEvaluation(mockSummary);

      const state = useEvaluationsStore.getState();
      expect(state.selectedEvaluation).toEqual(mockSummary);
    });

    it('should clear selected evaluation when passed null', () => {
      const mockSummary: EvaluationDetailSummary = {
        id: '1',
        name: 'Test',
        createdAt: new Date(),
        qaCatalog: null,
        metrics: [],
        metricResults: [],
        metricScores: [],
        status: 'SUCCESS' as any,
        testCaseProgress: { done: 10, total: 10 },
        version: 1,
      };

      useEvaluationsStore.getState().setSelectedEvaluation(mockSummary);
      useEvaluationsStore.getState().setSelectedEvaluation(null);

      const state = useEvaluationsStore.getState();
      expect(state.selectedEvaluation).toBeNull();
    });
  });
});
