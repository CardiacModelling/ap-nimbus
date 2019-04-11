import { Component, Inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';

import { ApPredictConfigService } from '../../service/ap-predict-config.service';

import { HomeComponent } from '../../home/home.component';
import { Model } from '../../class/model';
import { PlasmaIntermediatePointCount } from '../../class/plasma-intermediate-point-count';

@Component({
  selector: 'app-simulation-settings',
  templateUrl: './simulation-settings.component.html',
  styleUrls: ['./simulation-settings.component.css']
})
export class SimulationSettingsComponent implements OnChanges, OnInit {

  defaultModelId: number;

  configModels: Model[] = [];
  configPacingMaxTime: number;

  inputForm: FormGroup;

  @Input()
  processedInputData: object;

  constructor(@Inject('ApPredictConfigService')
                     private apPredictConfigService: ApPredictConfigService,
              private formBuilder: FormBuilder,
              private homeComponent: HomeComponent) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (typeof changes['processedInputData'] !== 'undefined') {
    }
  }

  ngOnInit() {
    var config = this.apPredictConfigService.retrieveConfig();

    this.configModels = config['models'];
    localStorage.setItem('configModels', JSON.stringify(this.configModels));
    localStorage.setItem('configPacingFrequencies', JSON.stringify(config['pacingFrequencies']));
    this.configPacingMaxTime = config['pacingMaxTime'];

    localStorage.setItem('configPlasmaPoints', JSON.stringify(config['plasmaPoints']));

    var modelMap = {};

    this.configModels.forEach((model) => {
      if (model.defaultModel) {
        this.defaultModelId = model.id;
      }
    });

    this.inputForm = this.createInputFormGroup();
  }

  /**
   * Create the form-backing object.
   * 
   * @return Form-backing object.
   */
  createInputFormGroup(): FormGroup {
    return this.formBuilder.group({
      fcModelId : [ this.defaultModelId, [ Validators.required ]],
      fcPacingFrequencies : new FormArray([]),
      fcPacingMaxTime : [ this.configPacingMaxTime, [ Validators.max(120),
                                                      this.validatorGTThan(0),
                                                      Validators.required ]],
      fcConcentrationPoints : new FormArray([])
    });
  }

  /**
   * 
   */
  hasError = (controlName: string, errorName: string) => {
    return this.inputForm.controls[controlName].hasError(errorName);
  }

  /**
   * Form submission processing.
   */
  onSubmit(): void {

    if (this.inputForm.invalid) {
      return;
    }

    var form_values = this.inputForm.value;

    this.homeComponent.runSimulations({
      'created': + new Date(),
      'modelId': form_values.fcModelId,
      'pacingFrequencies': form_values.fcPacingFrequencies,
      'pacingMaxTime': form_values.fcPacingMaxTime,
      'concentrations': form_values.fcConcentrationPoints
    });
  }

  /**
   * Form validation: If the control's value (i.e. the `input` field value) is greater than the
   * specified minimum value.
   *  
   * @param minVal Minimum permitted value.
   * @return `null` if everything ok, i.e. input value is greater than the minimum, otherwise an
   *         object generating a UI rejection.
   */
  validatorGTThan(minVal: number): ValidatorFn {
    return (control: AbstractControl): { [ key: string ]: any } | null => {
      // If user-entered value is gt minVal everything ok!
      return (control.value > minVal) ? null : { 'validatorGTThan': { } };
    };
  }

}