import { Autocomplete, Slider, Switch, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useMemo } from 'react';
import { useLlmEndpoints } from 'src/pages/admin/evals/llm-endpoints/hooks/useLlmEndpointQueries';
import { texts } from 'src/texts';

interface BaseMetricFieldsProps {
  form: UseFormReturnType<any>;
}

export function BaseMetricFields({ form }: BaseMetricFieldsProps) {
  // Fetch LLM endpoints with CHAT feature for chat model selection
  const { data: endpointsData, isLoading: isLoadingEndpoints } = useLlmEndpoints(0, undefined, ['CHAT']);

  // Extract endpoint options for autocomplete
  const chatModelOptions = useMemo(() => {
    if (!endpointsData) return [];
    return endpointsData.map((endpoint) => ({
      value: endpoint.id,
      label: endpoint.name,
    }));
  }, [endpointsData]);

  // Threshold marks for the slider
  const thresholdMarks = [
    { value: 0, label: '0' },
    { value: 0.25, label: '0.25' },
    { value: 0.5, label: '0.5' },
    { value: 0.75, label: '0.75' },
    { value: 1, label: '1' },
  ];

  return (
    <>
      <TextInput
        withAsterisk
        label={texts.evals.metric.nameLabel}
        placeholder={texts.evals.metric.namePlaceholder}
        className="mb-4"
        key={form.key('name')}
        {...form.getInputProps('name')}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          {texts.evals.metric.thresholdLabel}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">{texts.evals.metric.thresholdHint}</p>
        <Slider
          min={0}
          max={1}
          step={0.05}
          marks={thresholdMarks}
          label={(value) => value.toFixed(2)}
          className="mb-2"
          key={form.key('threshold')}
          {...form.getInputProps('threshold')}
        />
      </div>

      <Autocomplete
        withAsterisk
        label={texts.evals.metric.chatModelLabel}
        placeholder={texts.evals.metric.chatModelPlaceholder}
        description={texts.evals.metric.chatModelHint}
        data={chatModelOptions}
        disabled={isLoadingEndpoints}
        className="mb-4"
        key={form.key('chatModelId')}
        {...form.getInputProps('chatModelId')}
      />

      <Switch
        label={texts.evals.metric.strictModeLabel}
        description={texts.evals.metric.strictModeHint}
        className="mb-4"
        key={form.key('strictMode')}
        {...form.getInputProps('strictMode', { type: 'checkbox' })}
      />
    </>
  );
}
