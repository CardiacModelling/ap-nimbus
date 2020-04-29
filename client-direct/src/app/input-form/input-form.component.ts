import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';

import { AppredictConfigService } from '../appredict-config.service';
import { ApPredictInput, AssociatedData, AssociatedItem, SpreadData } from '../ap-predict-input';
import { ApPredictOutput } from '../ap-predict-output';
import { Model } from '../model';
import { PlasmaIntermediatePointCount } from '../plasma-intermediate-point-count';
import { SimulationService } from '../service/simulation.service';

import { LocalStorageItem } from '../utility-functions';

/**
 * Form for :
 *
 * <ul>
 *   <li>Presenting configured (via {@link AppredictConfigService}) input  values</li>
 *   <li>Handling user input and populating the input form</li>
 *   <li>
 *     Transferring values from the input form {@link FormGroup} to the {@link ApPredictInput}
 *     object
 *   </li>
 * </ul>
 */
@Component({
  selector: 'app-input-form',
  templateUrl: './input-form.component.html',
  styleUrls: ['./input-form.component.sass']
})

export class InputFormComponent implements OnInit {
  errorMessage: string;
  defaultModelId: number;
  defaultPIPCId: number;

  configModels: Model[] = [];
  configPacingFrequency: number;
  configPacingMaxTime: number;
  configPlasmaMaximum: number;
  configPlasmaMinimum: number;
  configPlasmaIntermediatePointCounts: PlasmaIntermediatePointCount[] = [];
  configPlasmaIntermediatePointLogScale: boolean;

  inputForm: FormGroup;
  apPredictInput: ApPredictInput;

  modelDescription: string;

  optionsFewer: string = 'Fewer options';
  optionsMore: string = 'More options';
  showMoreOptions: boolean = true;
  showMoreTitle: string = this.optionsMore;

  submitted: boolean = false;
  success: boolean = false;

  /**
   * Initialising constructor.
   *
   * @param apPredictConfigService `ApPredict` simulations default values configuration service.
   * @param simulationService Service for managing simulations.
   * @param router Angular app routing mechanism.
   * @param formBuilder Angular form-backing object mechanism.
   */
  constructor(private apPredictConfigService: AppredictConfigService,
              @Inject('ProvidedSimulationService') private simulationService: SimulationService,
              private router: Router,
              private formBuilder: FormBuilder) { }

  /**
   * Initialisation routine.
   *
   * Assigning default values from configuration settings.
   */
  ngOnInit() {
    this.configModels = this.apPredictConfigService.models;
    this.configPacingFrequency = this.apPredictConfigService.pacingFrequency;
    this.configPacingMaxTime = this.apPredictConfigService.pacingMaxTime;
    this.configPlasmaMaximum = this.apPredictConfigService.plasmaMaximum;
    this.configPlasmaMinimum = this.apPredictConfigService.plasmaMinimum;
    this.configPlasmaIntermediatePointCounts = this.apPredictConfigService.plasmaIntermediatePointCounts;
    this.configPlasmaIntermediatePointLogScale = this.apPredictConfigService.plasmaIntermediatePointLogScale;

    this.configModels.forEach((model) => {
      if (model.defaultModel) {
        this.defaultModelId = model.id;
        this.modelDescription = model.description;
      }
    });

    this.configPlasmaIntermediatePointCounts.forEach((plasmaIntermediatePointCount) => {
      if (plasmaIntermediatePointCount.isDefault) {
        this.defaultPIPCId = plasmaIntermediatePointCount.id;
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
      fcPacingFrequency : [ this.configPacingFrequency, [ Validators.min(0.05),
                                                          Validators.max(5),
                                                          Validators.required ]],
      fcPacingMaxTime : [ this.configPacingMaxTime, [ Validators.max(120),
                                                      this.validatorGTThan(0),
                                                      Validators.required ]],

      fcSpreadsEnabled : [ '', [ ]],

      fcIKrPIC50 : [ '', [ this.validatorOptionalNumber() ]],
      fcIKrHill : [ '', [ ]],
      fcIKrSaturation : [ '', [ ]],
      fcIKrPIC50Spread : [ '', [ ]],
      fcIKrHillSpread : [ '', [ ]],
      fcINaPIC50 : [ '', [ this.validatorOptionalNumber() ]],
      fcINaHill : [ '', [ ]],
      fcINaSaturation : [ '', [ ]],
      fcINaPIC50Spread : [ '', [ ]],
      fcINaHillSpread : [ '', [ ]],
      fcICaLPIC50 : [ '', [ this.validatorOptionalNumber() ]],
      fcICaLHill : [ '', [ ]],
      fcICaLSaturation : [ '', [ ]],
      fcICaLPIC50Spread : [ '', [ ]],
      fcICaLHillSpread : [ '', [ ]],
      fcIKsPIC50 : [ '', [ this.validatorOptionalNumber() ]],
      fcIKsHill : [ '', [ ]],
      fcIKsSaturation : [ '', [ ]],
      fcIKsPIC50Spread : [ '', [ ]],
      fcIKsHillSpread : [ '', [ ]],
      fcIK1PIC50 : [ '', [ this.validatorOptionalNumber() ]],
      fcIK1Hill : [ '', [ ]],
      fcIK1Saturation : [ '', [ ]],
      fcIK1PIC50Spread : [ '', [ ]],
      fcIK1HillSpread : [ '', [ ]],
      fcItoPIC50 : [ '', [ this.validatorOptionalNumber() ]],
      fcItoHill : [ '', [ ]],
      fcItoSaturation : [ '', [ ]],
      fcItoPIC50Spread : [ '', [ ]],
      fcItoHillSpread : [ '', [ ]],
      fcINaLPIC50 : [ '', [ this.validatorOptionalNumber() ]],
      fcINaLHill : [ '', [ ]],
      fcINaLSaturation : [ '', [ ]],
      fcINaLPIC50Spread : [ '', [ ]],
      fcINaLHillSpread : [ '', [ ]],

      fcPlasmaMaximum : [ this.configPlasmaMaximum, [ Validators.required,
                                                      this.validatorGTThan(0) ]],
      fcPlasmaMinimum : [ this.configPlasmaMinimum, [ Validators.required,
                                                      Validators.min(0) ]],
      fcPlasmaIntermediatePointCount : [ this.defaultPIPCId, [ Validators.required ]],
      fcPlasmaIntermediatePointLogScale : [ this.configPlasmaIntermediatePointLogScale,
                                            [ Validators.required ]]
    });
  }

  // Create an AssociatedItem for the ion channel
  private assignAssociatedItem(pIC50: string, hill: string, saturation: string,
                               c50Spread: string, hillSpread: string):
                               AssociatedItem {
    if (pIC50 == '') {
      return
    }
    var associatedData = new AssociatedData();
    associatedData.pIC50 = pIC50;
    associatedData.hill = hill;
    associatedData.saturation = saturation;

    var associatedItem = new AssociatedItem();
    associatedItem.associatedData.push(associatedData);

    if (c50Spread != '' || hillSpread != '') {
      var spreadData = new SpreadData();
      if (c50Spread != '') {
        spreadData.c50Spread = c50Spread;
      }
      if (hillSpread != '') {
        spreadData.hillSpread = hillSpread;
      }
      associatedItem.spreads = spreadData;
    }

    return associatedItem;
  }

  /**
   *
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
    this.apPredictInput.modelId = form_values.fcModelId;
    this.apPredictInput.pacingFrequency = form_values.fcPacingFrequency;
    this.apPredictInput.pacingMaxTime = form_values.fcPacingMaxTime;

    this.apPredictInput.IKr = this.assignAssociatedItem(form_values.fcIKrPIC50,
                                                        form_values.fcIKrHill,
                                                        form_values.fcIKrSaturation,
                                                        form_values.fcSpreadsEnabled && form_values.fcIKrPIC50Spread ? form_values.fcIKrPIC50Spread : '',
                                                        form_values.fcSpreadsEnabled && form_values.fcIKrHillSpread ? form_values.fcIKrHillSpread : '');
    this.apPredictInput.INa = this.assignAssociatedItem(form_values.fcINaPIC50,
                                                        form_values.fcINaHill,
                                                        form_values.fcINaSaturation,
                                                        form_values.fcSpreadsEnabled && form_values.fcINaPIC50Spread ? form_values.fcINaPIC50Spread : '',
                                                        form_values.fcSpreadsEnabled && form_values.fcINaHillSpread ? form_values.fcINaHillSpread : '');
    this.apPredictInput.ICaL = this.assignAssociatedItem(form_values.fcICaLPIC50,
                                                         form_values.fcICaLHill,
                                                         form_values.fcICaLSaturation,
                                                         form_values.fcSpreadsEnabled && form_values.fcICaLPIC50Spread ? form_values.fcICaLPIC50Spread : '',
                                                         form_values.fcSpreadsEnabled && form_values.fcICaLHillSpread ? form_values.fcICaLHillSpread : '');
    this.apPredictInput.IKs = this.assignAssociatedItem(form_values.fcIKsPIC50,
                                                        form_values.fcIKsHill,
                                                        form_values.fcIKsSaturation,
                                                        form_values.fcSpreadsEnabled && form_values.fcIKsPIC50Spread ? form_values.fcIKsPIC50Spread : '',
                                                        form_values.fcSpreadsEnabled && form_values.fcIKsHillSpread ? form_values.fcIKsHillSpread : '');
    this.apPredictInput.IK1 = this.assignAssociatedItem(form_values.fcIK1PIC50,
                                                        form_values.fcIK1Hill,
                                                        form_values.fcIK1Saturation,
                                                        form_values.fcSpreadsEnabled && form_values.fcIK1PIC50Spread ? form_values.fcIK1PIC50Spread : '',
                                                        form_values.fcSpreadsEnabled && form_values.fcIK1HillSpread ? form_values.fcIK1HillSpread : '');
    this.apPredictInput.Ito = this.assignAssociatedItem(form_values.fcItoPIC50,
                                                        form_values.fcItoHill,
                                                        form_values.fcItoSaturation,
                                                        form_values.fcSpreadsEnabled && form_values.fcItoPIC50Spread ? form_values.fcItoPIC50Spread : '',
                                                        form_values.fcSpreadsEnabled && form_values.fcItoHillSpread ? form_values.fcItoHillSpread : '');
    this.apPredictInput.INaL = this.assignAssociatedItem(form_values.fcINaLPIC50,
                                                        form_values.fcINaLHill,
                                                        form_values.fcINaLSaturation,
                                                        form_values.fcSpreadsEnabled && form_values.fcINaLPIC50Spread ? form_values.fcINaLPIC50Spread : '',
                                                        form_values.fcSpreadsEnabled && form_values.fcINaLHillSpread ? form_values.fcINaLHillSpread : '');

    this.apPredictInput.plasmaMaximum = form_values.fcPlasmaMaximum;
    this.apPredictInput.plasmaMinimum = form_values.fcPlasmaMinimum;
    this.apPredictInput.plasmaIntermediatePointCount = form_values.fcPlasmaIntermediatePointCount;
    this.apPredictInput.plasmaIntermediatePointLogScale = form_values.fcPlasmaIntermediatePointLogScale;

    this.simulationService.invokeApPredict(this.apPredictInput)
                          .subscribe(apPredictOutput => {
                                       var simulationId = apPredictOutput.id;
                                       var ipAddress = apPredictOutput.ipAddress;

                                       // Add the recently-created simulation id to the input data.
                                       this.apPredictInput.simulationId = simulationId;
                                       this.apPredictInput.created = + new Date();

                                       var apPredictInputStr = JSON.stringify(this.apPredictInput);
                                       localStorage.setItem(simulationId + '_' + LocalStorageItem.APPREDICT_INPUT,
                                                            apPredictInputStr);
                                       localStorage.setItem(simulationId + '_' + LocalStorageItem.IP_ADDRESS,
                                                            ipAddress);

                                       this.router.navigateByUrl("/results/" + simulationId);
                                     },
                                     error => this.errorMessage = <any>error);
    this.success = true;
  }

  /**
   * Toggle button to show/hide additional options.
   *
   */
  toggleShowMore() {
    this.showMoreOptions = !this.showMoreOptions;
    this.showMoreTitle = (this.showMoreOptions ? this.optionsMore : this.optionsFewer);
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

  /**
   * Form validation: If the control's value is a number.
   *
   * @return `null` if everything ok, i.e. it's a number, otherwise an object generating a UI
   *         rejection.
   */
  validatorOptionalNumber(): ValidatorFn {
    return (control: AbstractControl): { [ key: string ]: any } | null => {
      // If user-entered value is non-blank and a number, everything ok!
      return (control.value != null && !isNaN(control.value)) ? null : { 'validatorOptionalNumber': { } };
    };
  }

  /**
   * Debugging - diagnostics retrieval.
   *
   * @return Input object.
   */
  get diagnostic(): string {
    return JSON.stringify(this.apPredictInput);
  }
}
