import { TeamDistributionApi } from 'api';
import { useState } from 'react';
import { useMessage } from 'hooks';

const teamDistributionApi = new TeamDistributionApi();

export function useSubmitTeamScore(courseId: number, teamDistributionId: number) {
  const { message } = useMessage();
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!taskId) {
      message.error('Please select a task before submitting.');
      return;
    }
    try {
      setLoading(true);

      await teamDistributionApi.submitScore(courseId, teamDistributionId, taskId);

      setTaskId(null);
      message.success('Score submitted successfully.');
    } catch {
      message.error('Error occurred while submitting score.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleSubmit, setTaskId, taskId };
}
