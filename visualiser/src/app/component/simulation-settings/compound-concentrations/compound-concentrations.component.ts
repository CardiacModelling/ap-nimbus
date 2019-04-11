import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-compound-concentrations',
  templateUrl: './compound-concentrations.component.html',
  styleUrls: ['./compound-concentrations.component.css']
})
export class CompoundConcentrationsComponent {

  @Input()
  inputForm: FormGroup;
  @Input()
  processedInputData: object;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (typeof changes['processedInputData'] !== 'undefined') {
      var currentValue = changes['processedInputData'].currentValue;

      var useConcentrationPoints: number[];
      const experimentalConcentrationPoints = currentValue.concentrations;
      if (experimentalConcentrationPoints !== 'undefined' && experimentalConcentrationPoints.length > 0) {
        useConcentrationPoints = experimentalConcentrationPoints;
      } else {
        useConcentrationPoints = JSON.parse(localStorage.getItem('configPlasmaPoints'));
      }

      const arr = <FormArray>this.inputForm.controls.fcConcentrationPoints;
      while (arr.length > 0) {
        arr.removeAt(0);
      }
      useConcentrationPoints.forEach((concentrationPoint) => {
        arr.push(new FormControl(concentrationPoint));
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