import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pacing',
  templateUrl: './pacing.component.html',
  styleUrls: ['./pacing.component.css']
})
export class PacingComponent implements OnChanges {

  @Input()
  inputForm: FormGroup;
  @Input()
  processedInputData: object;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (typeof changes['processedInputData'] !== 'undefined') {
      var currentValue = changes['processedInputData'].currentValue;

      var usePacingFrequencies: number[];
      const experimentalPacingFrequencies = currentValue.pacingFrequencies;
      if (experimentalPacingFrequencies !== 'undefined' && experimentalPacingFrequencies.length > 0) {
        usePacingFrequencies = experimentalPacingFrequencies;
      } else {
        usePacingFrequencies = JSON.parse(localStorage.getItem('configPacingFrequencies'));
      }

      const arr = <FormArray>this.inputForm.controls.fcPacingFrequencies;
      while (arr.length > 0) {
        arr.removeAt(0);
      }
      usePacingFrequencies.forEach((pacingFrequency) => {
        arr.push(new FormControl(pacingFrequency));
      });
    }
  }

  /**
   * 
   */
  hasError = (controlName: string, errorName: string) => {
    return this.inputForm.controls[controlName].hasError(errorName);
  }

}