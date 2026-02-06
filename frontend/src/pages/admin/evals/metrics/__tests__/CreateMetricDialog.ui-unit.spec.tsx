import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { texts } from 'src/texts';
import { server } from '../../../../../mock/node';
import { render, required } from '../../../test-utils';
import { CreateMetricDialog } from '../dialogs/CreateMetricDialog';

const evalApiBaseUrl = `${import.meta.env.VITE_SERVER_URL}/api/eval`;

const mockLlmEndpoints = [
  {
    id: 'endpoint-1',
    name: 'GPT-4',
    type: 'OPENAI',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    _configuration: {
      type: 'OPENAI',
      name: 'GPT-4',
      model: 'gpt-4',
      apiKey: 'key',
      supportedFeatures: ['CHAT_MODEL'],
    },
  },
  {
    id: 'endpoint-2',
    name: 'Claude',
    type: 'C4',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    _configuration: {
      type: 'C4',
      name: 'Claude',
      baseUrl: 'https://api.anthropic.com',
      supportedFeatures: ['CHAT_MODEL'],
    },
  },
];

describe('CreateMetricDialog', () => {
  beforeEach(() => {
    // Mock LLM endpoints API
    server.use(
      http.get(`${evalApiBaseUrl}/v1/llm-endpoints`, () => {
        return HttpResponse.json(mockLlmEndpoints);
      })
    );
  });

  it('should render step 1: metric type selection', () => {
    render(<CreateMetricDialog onClose={vi.fn()} />);

    expect(screen.getByText(texts.evals.metric.createTitle)).toBeInTheDocument();
    expect(screen.getByText(texts.evals.metric.typeAnswerRelevancy)).toBeInTheDocument();
    expect(screen.getByText(texts.evals.metric.typeFaithfulness)).toBeInTheDocument();
    expect(screen.getByText(texts.evals.metric.typeHallucination)).toBeInTheDocument();
    expect(screen.getByText(texts.evals.metric.typeGEval)).toBeInTheDocument();
  });

  it('should navigate to step 2 when next is clicked', async () => {
    render(<CreateMetricDialog onClose={vi.fn()} />);

    const user = userEvent.setup();
    const nextButton = screen.getByRole('button', { name: texts.common.next });
    await user.click(nextButton);

    // Should show configuration step
    expect(screen.getByLabelText(required(texts.evals.metric.nameLabel))).toBeInTheDocument();
    expect(screen.getByText(texts.evals.metric.thresholdLabel)).toBeInTheDocument();
  });

  it('should navigate back to step 1 when back is clicked', async () => {
    render(<CreateMetricDialog onClose={vi.fn()} />);

    const user = userEvent.setup();

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: texts.common.next });
    await user.click(nextButton);

    // Go back to step 1
    const backButton = screen.getByRole('button', { name: texts.common.back });
    await user.click(backButton);

    // Should show type selection again
    expect(screen.getByText(texts.evals.metric.typeAnswerRelevancy)).toBeInTheDocument();
  });

  it('should validate required fields on submit', async () => {
    render(<CreateMetricDialog onClose={vi.fn()} />);

    const user = userEvent.setup();

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: texts.common.next });
    await user.click(nextButton);

    // Try to submit without filling fields
    const createButton = screen.getByRole('button', { name: texts.evals.metric.create });
    await user.click(createButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(texts.evals.metric.nameRequired)).toBeInTheDocument();
      expect(screen.getByText(texts.evals.metric.chatModelRequired)).toBeInTheDocument();
    });
  });

  it('should create simple metric successfully', async () => {
    const onClose = vi.fn();
    const onCreated = vi.fn();

    server.use(
      http.post(`${evalApiBaseUrl}/v1/metrics`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          id: 'new-metric-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          configuration: body.configuration,
        });
      })
    );

    render(<CreateMetricDialog onClose={onClose} onCreated={onCreated} />);

    const user = userEvent.setup();

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: texts.common.next });
    await user.click(nextButton);

    // Fill in required fields
    const nameInput = screen.getByLabelText(required(texts.evals.metric.nameLabel));
    await user.type(nameInput, 'My Test Metric');

    // Select chat model
    const chatModelSelect = screen.getByLabelText(required(texts.evals.metric.chatModelLabel));
    await user.click(chatModelSelect);
    await user.click(screen.getByText('GPT-4'));

    // Submit
    const createButton = screen.getByRole('button', { name: texts.evals.metric.create });
    await user.click(createButton);

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should show G-Eval specific fields when G-Eval is selected', async () => {
    render(<CreateMetricDialog onClose={vi.fn()} />);

    const user = userEvent.setup();

    // Select G-Eval
    const gEvalRadio = screen.getByLabelText(texts.evals.metric.typeGEval);
    await user.click(gEvalRadio);

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: texts.common.next });
    await user.click(nextButton);

    // Should show G-Eval specific fields
    expect(screen.getByText(texts.evals.metric.evaluationStepsLabel)).toBeInTheDocument();
    expect(screen.getByText(texts.evals.metric.evaluationParamsLabel)).toBeInTheDocument();

    // Should NOT show simple metric fields
    expect(screen.queryByText(texts.evals.metric.includeReasonLabel)).not.toBeInTheDocument();
  });

  it('should show simple metric fields when simple metric is selected', async () => {
    render(<CreateMetricDialog onClose={vi.fn()} />);

    const user = userEvent.setup();

    // Answer Relevancy is selected by default
    const nextButton = screen.getByRole('button', { name: texts.common.next });
    await user.click(nextButton);

    // Should show simple metric fields
    expect(screen.getByText(texts.evals.metric.includeReasonLabel)).toBeInTheDocument();

    // Should NOT show G-Eval fields
    expect(screen.queryByText(texts.evals.metric.evaluationStepsLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(texts.evals.metric.evaluationParamsLabel)).not.toBeInTheDocument();
  });

  it('should validate G-Eval evaluation steps', async () => {
    render(<CreateMetricDialog onClose={vi.fn()} />);

    const user = userEvent.setup();

    // Select G-Eval
    const gEvalRadio = screen.getByLabelText(texts.evals.metric.typeGEval);
    await user.click(gEvalRadio);

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: texts.common.next });
    await user.click(nextButton);

    // Fill name and chat model but leave evaluation steps empty
    const nameInput = screen.getByLabelText(required(texts.evals.metric.nameLabel));
    await user.type(nameInput, 'My G-Eval Metric');

    const chatModelSelect = screen.getByLabelText(required(texts.evals.metric.chatModelLabel));
    await user.click(chatModelSelect);
    await user.click(screen.getByText('GPT-4'));

    // Try to submit
    const createButton = screen.getByRole('button', { name: texts.evals.metric.create });
    await user.click(createButton);

    // Should show validation errors for evaluation steps
    await waitFor(() => {
      expect(screen.getByText(texts.evals.metric.evaluationStepsRequired)).toBeInTheDocument();
      expect(screen.getByText(texts.evals.metric.evaluationParamsRequired)).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    server.use(
      http.post(`${evalApiBaseUrl}/v1/metrics`, () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
      })
    );

    render(<CreateMetricDialog onClose={vi.fn()} />);

    const user = userEvent.setup();

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: texts.common.next });
    await user.click(nextButton);

    // Fill required fields
    const nameInput = screen.getByLabelText(required(texts.evals.metric.nameLabel));
    await user.type(nameInput, 'Test Metric');

    const chatModelSelect = screen.getByLabelText(required(texts.evals.metric.chatModelLabel));
    await user.click(chatModelSelect);
    await user.click(screen.getByText('GPT-4'));

    // Submit
    const createButton = screen.getByRole('button', { name: texts.evals.metric.create });
    await user.click(createButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(texts.evals.metric.createFailed)).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<CreateMetricDialog onClose={onClose} />);

    const user = userEvent.setup();
    const cancelButton = screen.getByRole('button', { name: texts.common.cancel });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });
});
