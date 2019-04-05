import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';

import { Compound } from '../class/compound';
import { DataService } from '../service/data.service';

import { compounds } from '../../assets/config/compounds.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  compounds: Compound[] = compounds;

  compoundData: string;
  defaultCompoundId: string;
  inputForm: FormGroup;

  constructor(@Inject('ProvidedDataService')
                      private dataService: DataService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.defaultCompoundId = 'cmpd1';

    this.inputForm = this.createInputFormGroup();
  }

  /**
   * Create the form-backing object.
   */
  createInputFormGroup() : FormGroup {
    return this.formBuilder.group({
      fcCompoundId : [ this.defaultCompoundId, [ Validators.required ]]
    });
  }

  /**
   * Form object error display.
   */
  hasError = (controlName: string, errorName: string) => {
    return this.inputForm.controls[controlName].hasError(errorName);
  }

  /**
   * Form submission processing.
   */
  onSubmit() : void {
    if (this.inputForm.invalid) {
      return;
    }

    this.compoundData = this.dataService.retrieveCompoundData(this.inputForm.value.fcCompoundId);
  }
}