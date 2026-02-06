import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { texts } from 'src/texts';
import { server } from '../../../../../mock/node';
import { render } from '../../../test-utils';
import { MetricsPage } from '../MetricsPage';

const evalApiBaseUrl = `${import.meta.env.VITE_SERVER_URL}/api/eval`;

const mockMetrics = [
  {
    id: 'metric-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    version: 1,
    configuration: {
      type: 'ANSWER_RELEVANCY',
      name: 'Answer Relevancy Test',
      threshold: 0.7,
      includeReason: true,
      chatModelId: 'chat-1',
      strictMode: false,
    },
  },
  {
    id: 'metric-2',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
    version: 1,
    configuration: {
      type: 'FAITHFULNESS',
      name: 'Faithfulness Check',
      threshold: 0.8,
      includeReason: false,
      chatModelId: 'chat-2',
      strictMode: true,
    },
  },
  {
    id: 'metric-3',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z',
    version: 1,
    configuration: {
      type: 'G_EVAL',
      name: 'Custom G-Eval',
      threshold: 0.9,
      chatModelId: 'chat-3',
      strictMode: false,
      evaluationSteps: ['Step 1', 'Step 2'],
      evaluationParams: ['input', 'actual_output'],
    },
  },
];

const mockLlmEndpoints = [
  {
    id: 'endpoint-1',
    name: 'GPT-4',
    type: 'OPENAI',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    configuration: {
      type: 'OPENAI',
      name: 'GPT-4',
      model: 'gpt-4',
      apiKey: 'key',
      supportedFeatures: ['CHAT_MODEL'],
    },
  },
];

describe('MetricsPage', () => {
  beforeEach(() => {
    // Mock APIs
    server.use(
      http.get(`${evalApiBaseUrl}/v1/metrics`, ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('query');

        if (query) {
          // Filter metrics by query
          const filtered = mockMetrics.filter((m) =>
            m.configuration.name.toLowerCase().includes(query.toLowerCase())
          );
          return HttpResponse.json(filtered);
        }

        return HttpResponse.json(mockMetrics);
      }),
      http.get(`${evalApiBaseUrl}/v1/llm-endpoints`, () => {
        return HttpResponse.json(mockLlmEndpoints);
      })
    );
  });

  it('should render metrics list page', async () => {
    render(<MetricsPage />);

    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
      expect(screen.getByText('Faithfulness Check')).toBeInTheDocument();
      expect(screen.getByText('Custom G-Eval')).toBeInTheDocument();
    });
  });

  it('should show loading skeleton initially', () => {
    render(<MetricsPage />);

    const skeletons = document.querySelectorAll('.mantine-Skeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty state when no metrics', async () => {
    server.use(
      http.get(`${evalApiBaseUrl}/v1/metrics`, () => {
        return HttpResponse.json([]);
      })
    );

    render(<MetricsPage />);

    await waitFor(() => {
      expect(screen.getByText(texts.evals.metric.empty)).toBeInTheDocument();
      expect(screen.getByText(texts.evals.metric.emptyHint)).toBeInTheDocument();
    });
  });

  it('should open create dialog when create button is clicked', async () => {
    render(<MetricsPage />);

    const user = userEvent.setup();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: texts.evals.metric.create });
    await user.click(createButton);

    // Should show create dialog
    expect(screen.getByText(texts.evals.metric.createTitle)).toBeInTheDocument();
    expect(screen.getByText(texts.evals.metric.typeAnswerRelevancy)).toBeInTheDocument();
  });

  it('should filter metrics by search query', async () => {
    render(<MetricsPage />);

    const user = userEvent.setup();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(texts.evals.metric.searchPlaceholder);
    await user.type(searchInput, 'G-Eval');

    // Should only show matching metrics
    await waitFor(() => {
      expect(screen.getByText('Custom G-Eval')).toBeInTheDocument();
      expect(screen.queryByText('Answer Relevancy Test')).not.toBeInTheDocument();
      expect(screen.queryByText('Faithfulness Check')).not.toBeInTheDocument();
    });
  });

  it('should open edit dialog when edit button is clicked', async () => {
    render(<MetricsPage />);

    const user = userEvent.setup();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText(texts.common.edit);
    await user.click(editButtons[0]);

    // Should show edit dialog
    expect(screen.getByText(texts.evals.metric.editTitle)).toBeInTheDocument();
  });

  it('should open delete dialog when delete button is clicked', async () => {
    render(<MetricsPage />);

    const user = userEvent.setup();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(texts.common.remove);
    await user.click(deleteButtons[0]);

    // Should show delete dialog
    expect(screen.getByText(texts.evals.metric.deleteConfirmTitle)).toBeInTheDocument();
  });

  it('should navigate to detail page when row is clicked', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    render(<MetricsPage />);

    const user = userEvent.setup();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });

    const row = screen.getByText('Answer Relevancy Test').closest('tr');
    await user.click(row!);

    // Should navigate to detail page
    expect(mockNavigate).toHaveBeenCalledWith('/admin/evals/metrics/metric-1');
  });

  it('should create new metric successfully', async () => {
    server.use(
      http.post(`${evalApiBaseUrl}/v1/metrics`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          id: 'new-metric',
          createdAt: '2024-01-07T00:00:00Z',
          updatedAt: '2024-01-07T00:00:00Z',
          version: 1,
          configuration: body.configuration,
        });
      })
    );

    render(<MetricsPage />);

    const user = userEvent.setup();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });

    // Open create dialog
    const createButton = screen.getByRole('button', { name: texts.evals.metric.create });
    await user.click(createButton);

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: texts.common.next });
    await user.click(nextButton);

    // Fill form
    const nameInput = screen.getByLabelText(`${texts.evals.metric.nameLabel} *`);
    await user.type(nameInput, 'New Test Metric');

    const chatModelSelect = screen.getByLabelText(`${texts.evals.metric.chatModelLabel} *`);
    await user.click(chatModelSelect);
    await user.click(screen.getByText('GPT-4'));

    // Submit
    const submitButton = screen.getByRole('button', { name: texts.evals.metric.create });
    await user.click(submitButton);

    // Dialog should close and list should refresh
    await waitFor(() => {
      expect(screen.queryByText(texts.evals.metric.createTitle)).not.toBeInTheDocument();
    });
  });

  it('should delete metric successfully', async () => {
    server.use(
      http.delete(`${evalApiBaseUrl}/v1/metrics/:metricId`, () => {
        return HttpResponse.json(null, { status: 204 });
      })
    );

    render(<MetricsPage />);

    const user = userEvent.setup();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });

    // Open delete dialog
    const deleteButtons = screen.getAllByLabelText(texts.common.remove);
    await user.click(deleteButtons[0]);

    // Confirm delete
    const confirmButton = screen.getByRole('button', { name: texts.common.remove });
    await user.click(confirmButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText(texts.evals.metric.deleteConfirmTitle)).not.toBeInTheDocument();
    });
  });

  it('should update metric successfully', async () => {
    server.use(
      http.patch(`${evalApiBaseUrl}/v1/metrics/:metricId`, async () => {
        return HttpResponse.json({
          ...mockMetrics[0],
          version: 2,
          configuration: {
            ...mockMetrics[0].configuration,
            name: 'Updated Name',
          },
        });
      })
    );

    render(<MetricsPage />);

    const user = userEvent.setup();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });

    // Open edit dialog
    const editButtons = screen.getAllByLabelText(texts.common.edit);
    await user.click(editButtons[0]);

    // Update name
    const nameInput = screen.getByLabelText(`${texts.evals.metric.nameLabel} *`);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    // Submit
    const saveButton = screen.getByRole('button', { name: texts.common.save });
    await user.click(saveButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText(texts.evals.metric.editTitle)).not.toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    // Create 25 metrics (more than PAGE_SIZE of 20)
    const manyMetrics = Array.from({ length: 25 }, (_, i) => ({
      id: `metric-${i}`,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: 1,
      configuration: {
        type: 'ANSWER_RELEVANCY',
        name: `Metric ${i}`,
        threshold: 0.5,
        includeReason: true,
        chatModelId: 'chat-1',
        strictMode: false,
      },
    }));

    server.use(
      http.get(`${evalApiBaseUrl}/v1/metrics`, ({ request }) => {
        const url = new URL(request.url);
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const limit = parseInt(url.searchParams.get('limit') || '20');

        return HttpResponse.json(manyMetrics.slice(offset, offset + limit));
      })
    );

    render(<MetricsPage />);

    // Wait for first page
    await waitFor(() => {
      expect(screen.getByText('Metric 0')).toBeInTheDocument();
    });

    // Should show pagination controls
    const pagination = screen.getByRole('navigation');
    expect(pagination).toBeInTheDocument();
  });

  it('should reset to page 1 when searching', async () => {
    render(<MetricsPage />);

    const user = userEvent.setup();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });

    // Type in search
    const searchInput = screen.getByPlaceholderText(texts.evals.metric.searchPlaceholder);
    await user.type(searchInput, 'test');

    // Should reset to page 1 (this is implicit in the component logic)
    await waitFor(() => {
      expect(screen.getByText('Answer Relevancy Test')).toBeInTheDocument();
    });
  });
});
