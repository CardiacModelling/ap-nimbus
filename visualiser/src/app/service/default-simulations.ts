import { Inject, Injectable } from '@angular/core';

import { ApPredictInput} from '../class/ap-predict-input';
import { SimulationService } from './simulation.service';
import { SimulationsService } from './simulations.service';

@Injectable()
export class DefaultSimulationsServiceImpl implements SimulationsService {

  constructor(@Inject('SimulationService')
                     private simulationService: SimulationService) { }

  private invokeSimulations(simulationsInput: object, simulationsOutput: object): void {
    let assayData = simulationsInput['assay'];

    assayData.forEach((assayGroupData) => {
      let apPredictInputs = assayGroupData['apPredictInputs'];

      apPredictInputs.forEach((apPredictInput) => {
        this.simulationService.invokeApPredict(apPredictInput)
            .subscribe(apPredictOutput => {
                         let simulationId = apPredictOutput.id;
                         // var ipAddress = apPredictOutput.ipAddress;

                         simulationsOutput['output'][simulationId] = apPredictInput;
                       },
                       error => console.log('invoke error ' + JSON.stringify(<any>error)));
      });
    });
  }

  private prepareSimulations(simulationsInput: object): void {
    // simulation-settings.component.ts
    let created = simulationsInput['created'];
    let modelId = simulationsInput['modelId'];
    let pacingFrequencies = simulationsInput['pacingFrequencies'];
    let pacingMaxTime = simulationsInput['pacingMaxTime'];
    let concentrations = simulationsInput['concentrations'];
    let assayData = simulationsInput['assay'];

    assayData.forEach((assayGroupData) => {
      let apPredictInput = new ApPredictInput();

      apPredictInput.created = created;
      apPredictInput.modelId = modelId;
      apPredictInput.pacingMaxTime = pacingMaxTime;
      apPredictInput.plasmaPoints = concentrations;

      let groupName = assayGroupData.groupName;                    // e.g. Quattro,FLIPR,Barracuda
      let groupLevel = assayGroupData.groupLevel;                  // e.g. 1

      assayGroupData.inputValues.forEach((ionChannelData) => {
        let ionChannelName = ionChannelData.ionChannelName;        // e.g. KCNQ1
        let pIC50s = ionChannelData.pIC50s;                        // e.g. "4.3000000000,4.3000000000,4.3000000000,4.3000000000"
        let hills = ionChannelData.hills;                          // e.g. "0.9200000000,0.9200000000,0.9200000000,0.9200000000"

        switch (ionChannelName) {
          case "hERG":
            apPredictInput.pIC50sIKr = pIC50s;
            break;
          case "NaV1_5":
            apPredictInput.pIC50sINa = pIC50s;
            break;
          case "CaV1_2":
            apPredictInput.pIC50sICaL = pIC50s;
            break;
          case "KCNQ1":
            apPredictInput.pIC50sIKs = pIC50s;
            break;
          case "IK1":
            apPredictInput.pIC50sIK1 = pIC50s;
            break;
          case "Ito":
            apPredictInput.pIC50sIto = pIC50s;
            break;
          default:
            console.log("Unrecognised ion channel name: '" + ionChannelName + "'");
        }
      });

      let apPredictInputs = [];
      pacingFrequencies.forEach((pacingFrequency) => {
        // https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
        let perFreqApPredictInput = JSON.parse(JSON.stringify(apPredictInput));
        perFreqApPredictInput.pacingFrequency = pacingFrequency;
        perFreqApPredictInput.metaData = {
          'title': groupName + '@' + pacingFrequency + 'Hz'
        };

        apPredictInputs.push(perFreqApPredictInput);
      });
      assayGroupData['apPredictInputs'] = apPredictInputs;
    });
  }

  /**
   * {@link SimulationsService#runSimulations }
   */
  // Called by HomeComponent#runSimulations()
  runSimulations(simulationsInput: object, simulationsOutput: object): void {
    this.prepareSimulations(simulationsInput);

    this.invokeSimulations(simulationsInput, simulationsOutput);
  }
}