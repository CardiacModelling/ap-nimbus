import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';

import { ApPredictConfigService } from '../../service/ap-predict-config.service';

import { ApPredictInput } from '../../class/ap-predict-input';
import { Model } from '../../class/model';
import { PlasmaIntermediatePointCount } from '../../class/plasma-intermediate-point-count';

@Component({
  selector: 'app-simulation-defaults',
  templateUrl: './simulation-defaults.component.html',
  styleUrls: ['./simulation-defaults.component.css']
})
export class SimulationDefaultsComponent implements OnInit {

  defaultModelId: number;

  configModels: Model[] = [];
  configPacingFrequencies: number[] = [];
  configPacingMaxTime: number;
  configPlasmaMaximum: number;
  configPlasmaMinimum: number;
  configPlasmaIntermediatePointCounts: PlasmaIntermediatePointCount[] = [];
  configPlasmaIntermediatePointLogScale: boolean;

  inputForm: FormGroup;
  apPredictInput: ApPredictInput;

  modelDescription: string;
  submitted: boolean = false;
  success: boolean = false;

  constructor(@Inject('ApPredictConfigService')
                     private apPredictConfigService: ApPredictConfigService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    var config = this.apPredictConfigService.retrieveConfig();

    this.configModels = config['models'];
    this.configPacingFrequencies = config['pacingFrequencies'];
    this.configPacingMaxTime = config['pacingMaxTime'];
    this.configPlasmaMaximum = config['plasmaMaximum'];
    this.configPlasmaMinimum = config['plasmaMinimum'];
    this.configPlasmaIntermediatePointCounts = config['configPlasmaIntermediatePointCounts'];
    this.configPlasmaIntermediatePointLogScale = config['configPlasmaIntermediatePointLogScale'];

    var modelMap = {};

    this.configModels.forEach((model) => {
      if (model.defaultModel) {
        this.defaultModelId = model.id;
        this.modelDescription = model.description;
      }
    });

    this.configModels.forEach((model) => {
      modelMap[model.id] = model.name;
    });

    console.log('Default pacing frequencies ' + this.configPacingFrequencies);
    console.log('Default pacing max time ' + this.configPacingMaxTime);

    this.inputForm = this.createInputFormGroup();
  }

  /**
   * Create the form-backing object.
   * 
   * @return Form-backing object.
   */
  createInputFormGroup(): FormGroup {
    return this.formBuilder.group({
      fcModelId : [ this.defaultModelId, [ Validators.required ]]
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

    //this.apPredictInput.pacingFrequency = form_values.fcPacingFrequency;
    //this.apPredictInput.pacingMaxTime = form_values.fcPacingMaxTime;
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

    this.success = true;
  }

  /**
   * Update the CellML model description in response to `select` element events.
   * 
   * @param event `select` element change event.
   */
  updateDescription(event): void {
    var selected_model = this.configModels.filter(function(val) {
      return val.id === event.value;
    });
    if (selected_model.length > 0) {
      this.modelDescription = selected_model[0].description;
    } else {
      this.modelDescription = "Unknown";
    }
  }

}