import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Text, Stepper, Group, Button, Modal } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useWizardStore, useWizardStepIndex, useIsLastStep } from './create/wizardState';
import { ModeSelectionStep } from './create/steps/ModeSelectionStep';
import { SourceStep } from './create/steps/SourceStep';
import { MetricsSelectionStep } from './create/steps/MetricsSelectionStep';
import { EndpointSelectionStep } from './create/steps/EndpointSelectionStep';
import { ReviewStep } from './create/steps/ReviewStep';
import { useCreateEvaluation } from './hooks/useEvaluationMutations';
import { texts } from 'src/texts';
import type { Dto, RunEvaluationByQaCatalog, RunEvaluationByTestCases } from 'src/api/generated-eval';

export function CreateEvaluationPage() {
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    currentStep,
    mode,
    name,
    description,
    catalogId,
    testCasesPerQaPair,
    testCases,
    metricIds,
    endpointId,
    nextStep,
    previousStep,
    canProceed,
    reset,
  } = useWizardStore();

  const stepIndex = useWizardStepIndex();
  const isLastStep = useIsLastStep();
  const isFirstStep = stepIndex === 0;

  const createEvaluationMutation = useCreateEvaluation();

  const handleNext = () => {
    if (canProceed()) {
      nextStep();
    }
  };

  const handleBack = () => {
    previousStep();
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    reset();
    setShowCancelDialog(false);
    navigate('/admin/evals/evaluations');
  };

  const handleCreate = () => {
    // Build the DTO - map our state to the Dto type the API expects
    const dto: Dto = {
      name,
      llmEndpointId: endpointId!,
      metrics: metricIds,
    } as any;

    // Add description if provided
    if (description) {
      (dto as any).description = description;
    }

    // Add mode-specific fields
    if (mode === 'catalog') {
      dto.catalogId = catalogId!;
      dto.testCasesPerQaPair = testCasesPerQaPair || 1;
    } else {
      dto.testCases = testCases;
    }

    createEvaluationMutation.mutate(dto, {
      onSuccess: (evaluation) => {
        reset();
        navigate(`/admin/evals/evaluations/${evaluation.id}`);
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'mode':
        return <ModeSelectionStep />;
      case 'source':
        return <SourceStep />;
      case 'metrics':
        return <MetricsSelectionStep />;
      case 'endpoint':
        return <EndpointSelectionStep />;
      case 'review':
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <>
      <Stack gap="lg">
        {/* Page Header */}
        <div>
          <Text size="xl" fw={700}>
            {texts.evals.evaluations.createEvaluation}
          </Text>
          <Text size="sm" c="dimmed">
            {texts.evals.evaluations.createEvaluationDescription}
          </Text>
        </div>

        {/* Stepper */}
        <Stepper active={stepIndex} size="sm" iconSize={32}>
          <Stepper.Step
            label={texts.evals.evaluations.wizard.modeStep}
            description={texts.evals.evaluations.wizard.modeStepDescription}
            completedIcon={<IconCheck size={18} />}
          />
          <Stepper.Step
            label={texts.evals.evaluations.wizard.sourceStep}
            description={texts.evals.evaluations.wizard.sourceStepDescription}
            completedIcon={<IconCheck size={18} />}
          />
          <Stepper.Step
            label={texts.evals.evaluations.wizard.metricsStep}
            description={texts.evals.evaluations.wizard.metricsStepDescription}
            completedIcon={<IconCheck size={18} />}
          />
          <Stepper.Step
            label={texts.evals.evaluations.wizard.endpointStep}
            description={texts.evals.evaluations.wizard.endpointStepDescription}
            completedIcon={<IconCheck size={18} />}
          />
          <Stepper.Step
            label={texts.evals.evaluations.wizard.reviewStep}
            description={texts.evals.evaluations.wizard.reviewStepDescription}
            completedIcon={<IconCheck size={18} />}
          />
        </Stepper>

        {/* Step Content */}
        <div style={{ minHeight: '400px' }}>{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <Group justify="space-between">
          <Button variant="subtle" onClick={handleCancel}>
            {texts.common.cancel}
          </Button>

          <Group>
            {!isFirstStep && (
              <Button variant="default" onClick={handleBack}>
                {texts.common.back}
              </Button>
            )}

            {!isLastStep ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                {texts.common.next}
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={!canProceed()}
                loading={createEvaluationMutation.isPending}
              >
                {texts.evals.evaluations.createEvaluation}
              </Button>
            )}
          </Group>
        </Group>
      </Stack>

      {/* Cancel Confirmation Modal */}
      <Modal
        opened={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title={texts.evals.evaluations.wizard.cancelConfirmTitle}
        centered
      >
        <Stack gap="md">
          <Text size="sm">{texts.evals.evaluations.wizard.cancelConfirmMessage}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setShowCancelDialog(false)}>
              {texts.common.no}
            </Button>
            <Button color="red" onClick={handleConfirmCancel}>
              {texts.common.yes}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
