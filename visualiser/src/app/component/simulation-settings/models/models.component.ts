import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Model } from '../../../class/model';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.css']
})
export class ModelsComponent implements OnInit {

  configModels: Model[] = [];
  defaultModelId: number;

  modelDescription: string;

  @Input()
  inputForm: FormGroup;

  constructor() { }

  ngOnInit() {
    this.configModels = JSON.parse(localStorage.getItem('configModels'));
    this.configModels.forEach((model) => {
      if (model.defaultModel) {
        this.modelDescription = model.name;
        return;
      }
    });
  }

  /**
   * 
   */
  hasError = (controlName: string, errorName: string) => {
    return this.inputForm.controls[controlName].hasError(errorName);
  }

  /**
   * Update the CellML model description in response to `select` element events.
   * 
   * @param event `select` element change event.
   */
  updateModelDescription(event): void {
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