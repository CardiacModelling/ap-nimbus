/**
 * `ApPredict` simulation output data.
 */

/**
 * Simulation output data type. 
 */
export enum DataType {
  PROGRESS,
  STDERR,
  STDOUT,
  STOP_INDICATOR,
  VOLTAGE_RESULTS,
  VOLTAGE_TRACES
}

export class ApPredictOutput {

  private readonly placeholderData: string = '{}';
  private readonly waitingForDataMsg: string = 'Waiting for data';

  // Unique simulation identifier.
  id: string;
  // Optional debug info.
  ipAddress: string = 'undefined';
  // "`true`" if simulation has completed, otherwise "`false`".
  completed: boolean = false;
  // Simulation progress.
  progress: string = this.placeholderData;
  // Simulation results - voltage results.
  voltageResults: string = this.placeholderData;
  // Simulation results - voltage traces.
  voltageTraces: string = this.placeholderData;
  // Information message
  message: string;
  // StdErr
  stdErr: string;
  // StdOut
  stdOut: string;

  /**
   * Initialising constructor.
   *
   * @param id Simulation identifier.
   */
  constructor(id: string) {
    this.id = id;
  }

  /**
   * Indicator of presence of specified data.
   * 
   * @param dataType Data type to query presence of.
   * @return "`true`" if output has the specified data, otherwise "`false`".
   */
  hasData(dataType: DataType) : boolean {
    switch (dataType) {
      case DataType.PROGRESS:
        return (typeof this.progress !== 'undefined' &&
                !this.isPlaceholderData(this.progress));
      case DataType.STDERR:
        return (typeof this.stdErr !== 'undefined');
      case DataType.STDOUT:
        return (typeof this.stdOut !== 'undefined');
      case DataType.STOP_INDICATOR:
        return (this.completed == true);
      case DataType.VOLTAGE_RESULTS:
        return (typeof this.voltageResults !== 'undefined' &&
                !this.isPlaceholderData(this.voltageResults));
      case DataType.VOLTAGE_TRACES:
        return (typeof this.voltageTraces !== 'undefined' &&
                !this.isPlaceholderData(this.voltageTraces));
      default:
        break;
    }
    return false;
  }

  /**
   * Indicator of output awaiting data.
   * 
   * @return "`true`" if awaiting data, otherwise "`false`".
   */
  hasWaitingMessage() : boolean {
    return (this.message == this.waitingForDataMsg);
  }

  /**
   * Indicate if string to test represents placeholder text.
   * 
   * @param testStr String to test.
   * @return "`true`" if the string equates to placeholder text, otherwise "`false`".
   */
  isPlaceholderData(testStr: string) : boolean {
    return (testStr == this.placeholderData);
  }

  /**
   * Indicator of simulation completion.
   * 
   * @return `true` if simulation complete, otherwise (including 'status not known') `false`.
   */
  getCompleted() : boolean {
    return this.completed;
  }

  /**
   * Set indicator of simulation having completed.
   */
  setCompleted() : void {
    this.completed = true;
  }

  /**
   * Assign progress status data.
   * 
   * @param progress Progress status data.
   */
  setProgress(progress: string) : void {
    this.progress = progress;
  }

  setStdErr(stdErr: string) : void {
    this.stdErr = stdErr;
  }

  setStdOut(stdOut: string) : void {
    this.stdOut = stdOut;
  }

  /**
   * Assign voltage results data.
   * 
   * @param voltageResults Voltage results data.
   */
  setVoltageResults(voltageResults: string) : void {
    this.voltageResults = voltageResults;
  }

  /**
   * Assign voltage traces data.
   * 
   * @param voltageTraces Voltage traces data.
   */
  setVoltageTraces(voltageTraces: string) : void {
    this.voltageTraces = voltageTraces;
  }

  /**
   * Assign an error message.
   * 
   * @param errorMsg Error message to assign.
   */
  setErrorMessage(errorMsg: string) : void {
    this.message = errorMsg;
  }

  /**
   * Assign the message indicating awaiting data.
   */
  setWaitingForDataMessage() : void {
    this.message = this.waitingForDataMsg;
  }

}
