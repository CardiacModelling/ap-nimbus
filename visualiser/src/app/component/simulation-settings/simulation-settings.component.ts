import { Component, Inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';

import { ApPredictConfigService } from '../../service/ap-predict-config.service';

import { ApPredictInput } from '../../class/ap-predict-input';
import { Model } from '../../class/model';
import { PlasmaIntermediatePointCount } from '../../class/plasma-intermediate-point-count';

@Component({
  selector: 'app-simulation-settings',
  templateUrl: './simulation-settings.component.html',
  styleUrls: ['./simulation-settings.component.css']
})
export class SimulationSettingsComponent implements OnInit {

  defaultModelId: number;
  //defaultPIPCId: number;

  configModels: Model[] = [];
  configPacingMaxTime: number;

  //configPlasmaMaximum: number;
  //configPlasmaMinimum: number;
  //configPlasmaIntermediatePointCounts: PlasmaIntermediatePointCount[] = [];
  //configPlasmaIntermediatePointLogScale: boolean;

  inputForm: FormGroup;
  apPredictInput: ApPredictInput;

  submitted: boolean = false;
  success: boolean = false;

  @Input()
  processedInputData: object;

  constructor(@Inject('ApPredictConfigService')
                     private apPredictConfigService: ApPredictConfigService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    var config = this.apPredictConfigService.retrieveConfig();

    this.configModels = config['models'];
    localStorage.setItem('configModels', JSON.stringify(this.configModels));
    localStorage.setItem('configPacingFrequencies', JSON.stringify(config['pacingFrequencies']));
    this.configPacingMaxTime = config['pacingMaxTime'];

    //this.configPlasmaMaximum = config['plasmaMaximum'];
    //this.configPlasmaMinimum = config['plasmaMinimum'];
    //this.configPlasmaIntermediatePointCounts = config['plasmaIntermediatePointCounts'];
    //this.configPlasmaIntermediatePointLogScale = config['plasmaIntermediatePointLogScale'];

    localStorage.setItem('configPlasmaPoints', JSON.stringify(config['plasmaPoints']));

    var modelMap = {};

    this.configModels.forEach((model) => {
      if (model.defaultModel) {
        this.defaultModelId = model.id;
      }
    });

    //this.configPlasmaIntermediatePointCounts.forEach((plasmaIntermediatePointCount) => {
    //  if (plasmaIntermediatePointCount.isDefault) {
    //    this.defaultPIPCId = plasmaIntermediatePointCount.id;
    //  }
    //});

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

      /*,
      fcPlasmaMaximum : [ this.configPlasmaMaximum, [ Validators.required,
                                                      this.validatorGTThan(0) ]],
      fcPlasmaMinimum : [ this.configPlasmaMinimum, [ Validators.required,
                                                      Validators.min(0) ]],
      fcPlasmaIntermediatePointCount : [ this.defaultPIPCId, [ Validators.required ]],
      fcPlasmaIntermediatePointLogScale : [ this.configPlasmaIntermediatePointLogScale,
                                            [ Validators.required ]] */
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
    this.submitted = true;

    if (this.inputForm.invalid) {
      return;
    }

    this.apPredictInput = new ApPredictInput();
    var form_values = this.inputForm.value;
    this.apPredictInput.created = + new Date();
    this.apPredictInput.modelId = form_values.fcModelId;
    this.apPredictInput.pacingFrequencies = form_values.fcPacingFrequencies;

    this.apPredictInput.pacingMaxTime = form_values.fcPacingMaxTime;

    this.apPredictInput.plasmaPoints = form_values.fcConcentrationPoints;

    //this.apPredictInput.plasmaMaximum = form_values.fcPlasmaMaximum;
    //this.apPredictInput.plasmaMinimum = form_values.fcPlasmaMinimum;
    //this.apPredictInput.plasmaIntermediatePointCount = form_values.fcPlasmaIntermediatePointCount;
    //this.apPredictInput.plasmaIntermediatePointLogScale = form_values.fcPlasmaIntermediatePointLogScale;

    //this.apPredictInput.pIC50IKr = form_values.fcIKrPIC50;
    //this.apPredictInput.pIC50INa = form_values.fcINaPIC50;
    //this.apPredictInput.pIC50ICaL = form_values.fcICaLPIC50;
    //this.apPredictInput.pIC50IKs = form_values.fcIKsPIC50;
    //this.apPredictInput.pIC50IK1 = form_values.fcIK1PIC50;
    //this.apPredictInput.pIC50Ito = form_values.fcItoPIC50;

    //console.log(this.processedInputData.assay);

    console.log('ApPredictInput ' + JSON.stringify(this.apPredictInput))

    this.success = true;
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