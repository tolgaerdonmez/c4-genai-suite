import { Card, Text, Stack, Badge, Group, SimpleGrid } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';
import type { EvaluationDetailSummary } from 'src/api/generated-eval';
import { texts } from 'src/texts';

interface MetricsDisplayProps {
  evaluation: EvaluationDetailSummary;
}

export function MetricsDisplay({ evaluation }: MetricsDisplayProps) {
  // Fallback: Display metrics from evaluation data without full metrics API
  const metrics = evaluation.metrics || [];
  const metricResults = evaluation.metricResults || [];

  if (metrics.length === 0) {
    return (
      <Card padding="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Group gap="xs">
            <IconChartBar size={20} className="text-gray-600" />
            <Text fw={600} size="lg">
              {texts.evals.evaluations.metrics}
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            No metrics configured for this evaluation.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="xs">
          <IconChartBar size={20} className="text-gray-600" />
          <Text fw={600} size="lg">
            {texts.evals.evaluations.metrics}
          </Text>
          <Badge variant="light" color="blue">
            {metrics.length} metric{metrics.length !== 1 ? 's' : ''}
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {metrics.map((metric, index) => {
            // Find corresponding metric result for average score
            const metricResult = metricResults.find((mr) => mr.metricId === metric.id);
            const avgScore = metricResult?.meanScore;

            return (
              <Card key={metric.id} padding="sm" withBorder>
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    {metric.name}
                  </Text>
                  <Badge variant="light" size="sm" color="gray">
                    {metric.type}
                  </Badge>
                  {avgScore !== undefined && (
                    <Text size="xs" c="dimmed">
                      Avg Score: {avgScore.toFixed(3)}
                    </Text>
                  )}
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
