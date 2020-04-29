import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppredictConfigService } from '../appredict-config.service';
import { AppRoutingModule } from '../app-routing.module';
import { ApPredictInput, AssociatedItem } from '../ap-predict-input';
import { Model } from '../model';

import { displayData, AssociatedItemType, LocalStorageItem } from '../utility-functions';

/**
 * Simulations component for displaying simulations.
 */
@Component({
  selector: 'app-simulations',
  templateUrl: './simulations.component.html',
  styleUrls: ['./simulations.component.sass']
})

export class SimulationsComponent implements OnInit {

  configModels: Model[] = [];
  simulationArray = [];

  /**
   * Initialising constructor.
   *
   * @param apPredictConfigService `ApPredict` simulations default values configuration service.
   * @param router Angular app routing mechanism.
   */
  constructor(private apPredictConfigService: AppredictConfigService,
              private router: Router) { }

  /**
   * Angular hook - initialisation routine.
   *
   * Assigning values from configuration settings.
   */
  ngOnInit() {
    this.configModels = this.apPredictConfigService.models;
    var modelMap = {};

    this.configModels.forEach((model) => {
      modelMap[model.id] = model.name;
    });

    this.loadSimulationArray();
  }

  /**
   * Delete a simulation.
   *
   * The simulation's existence will be removed from the local storage mechanism only - the
   * simulation itself may still be running.
   *
   * @param simulationId Simulation identifier.
   */
  deleteSimulation(simulationId: string) : void {
    for (let item in LocalStorageItem) {
      if (!isNaN(Number(item))) {
        localStorage.removeItem(simulationId + '_' + item);
      }
    }

    this.loadSimulationArray();
  }

  /**
   * @see {@link utility-functions#displayData() }
   */
  displayPIC50(associatedItem: AssociatedItem): string {
    return displayData(associatedItem, AssociatedItemType.PIC50);
  }

  /**
   * Retrieve a date is a locale'd format.
   *
   * @param timestamp A locale'd format date.
   * @return Date according to locale (or "unknown" if date undefined).
   */
  displayDate(timestamp: number) : string {
    if (timestamp !== undefined) {
      return new Date(timestamp).toLocaleString();
    } else {
      return "Unknown";
    }
  }

  // Load a collection of simulation data from the local storage.
  private loadSimulationArray() : void {
    this.simulationArray = [];

    for (var i = 0; i < localStorage.length; i++){
      var key = localStorage.key(i);
      if (key.endsWith('_' + LocalStorageItem.APPREDICT_INPUT)) {
        var obj = JSON.parse(localStorage.getItem(localStorage.key(i)));
        this.simulationArray.push(obj);
      }
    }

    this.simulationArray.sort(function(a, b) {
      return b.created - a.created;
    });
  }

  /**
   * Retrieve the model name based on the supplied model identifier.
   *
   * See also `src/assets/config/appredict.json`.
   *
   * @param modelId Model identifier.
   */
  modelName(modelId: number) : string {
    // Find the selected model in those configured, based on the model identifier.
    var selected_model = this.configModels.filter(function(val) {
      return val.id === modelId;
    });

    var modelName = "Unknown";
    if (selected_model.length > 0) {
      modelName = selected_model[0].name;
    }

    return modelName;
  }

  /**
   * Navigate to the user input page.
   */
  viewInputPage() : void {
    AppRoutingModule.goToInputPage(this.router);
  }

  /**
   * Navigate to the 'results' view page of the specified simulation.
   *
   * @param simulationId Simulation identifier.
   */
  viewResultsPage(simulationId: string) : void {
    AppRoutingModule.goToResultsPage(this.router, simulationId);
  }
}
