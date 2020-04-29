import { ApPredictOutput } from './ap-predict-output';

describe('ApPredictOutput', () => {

  let id: string;
  let completed: boolean;
  let progress: string;
  let voltageTraces: string;

  beforeEach(() => {
    id = 'id';
    completed = true;
    progress = 'progress';
    voltageTraces = 'voltageTraces';
  });

  it('should create', () => {
    const apPredictOutput = new ApPredictOutput(id, completed, progress, voltageTraces);
    expect(apPredictOutput.id).toBe(id, 'id should be constructor-assigned');
    expect(apPredictOutput.completed)
          .toBe(true, 'completed should be constructor-assigned');
    expect(apPredictOutput.progress)
          .toBe(progress, 'progress should be constructor-assigned');
    expect(apPredictOutput.voltageTraces)
          .toBe(voltageTraces, 'voltageTraces should be constructor-assigned');
  });
});
