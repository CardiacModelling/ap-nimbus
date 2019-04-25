import { Inject, Injectable } from '@angular/core';

import { ApPredictInput, AssociatedItem, ChannelData, Spreads } from '../class/ap-predict-input';
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

  private numbers(arr) {
    if (!arr.every((element) => {
          return (typeof element !== 'undefined ' && element.trim() != '' &&
                  !isNaN(parseFloat(element)) && isFinite(element));
         })) {
       return;
    }

    return true;
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
        let saturations = ionChannelData.saturations;

        let pIC50Array = [];
        let hillArray = [];
        let saturationArray = [];

        if (typeof pIC50s !== 'undefined' && pIC50s.trim().length > 0) {
          // There's definitely something in the pIC50s
          if (pIC50s.includes(',')) {
            // Looks like a CSV of input values.
            pIC50Array = pIC50s.split(',');
          } else {
            // Single pIC50
            pIC50Array.push(pIC50s);
          }
        }
        if (!this.numbers(pIC50Array)) {
          console.log('WARN : Non-numeric encountered in pIC50s ! : ' + JSON.stringify(pIC50Array));
          return;
        }
        let pIC50Count = pIC50Array.length;

        if (typeof hills !== 'undefined' && hills.trim().length > 0 {
          if (hills.includes(',')) {
            hillArray = hills.split(',');
          } else {
            hillArray.push(hills);
          }
          if (!this.numbers(hillArray)) {
            console.log('WARN : Non-numeric encountered in Hills ! : ' + JSON.stringify(hillArray));
            return;
          }
          let hillCount = hillArray.length;
          if (hillCount != pIC50Count) {
            console.log('WARN : Inconsistency pIC50 data : ' + pIC50s);
            console.log('WARN : Inconsistency Hill data  : ' + hills);
            return;
          }
        } else {
          // No Hill values supplied - default all to 1
          for (let idx = 0; idx < pIC50Count; idx++) {
            hillArray.push(1);
          }
        }
        if (typeof saturations !== 'undefined' && saturations.trim().length > 0 {
          if (saturations.includes(',')) {
            saturationArray = saturations.split(',');
          } else {
            saturationArray.push(saturations);
          }
          if (!this.numbers(saturationArray)) {
            console.log('WARN : Non-numeric encountered in saturations ! : ' + JSON.stringify(saturationArray));
            return;
          }
          let saturationCount = saturationArray.length;
          if (saturationCount != pIC50Count) {
            console.log('WARN : Inconsistency pIC50      data : ' + pIC50s);
            console.log('WARN : Inconsistency saturation data : ' + saturations);
            return;
          }
        } else {
          // No saturation values supplied - default all to 0
          for (let idx = 0; idx < pIC50Count; idx++) {
            saturationArray.push(0);
          }
        }

        let associatedData: AssociatedItem[] = [];
        for (let idx = 0; idx < pIC50Array.length; idx++) {
          let eachPIC50 = pIC50Array[idx];
          let eachHill = hillArray[idx];
          let eachSaturation = saturationArray[idx];
          associatedData.push(new AssociatedItem(eachPIC50, eachHill, eachSaturation));
        }
        let spreadData = new Spreads(null, null); 
        let channelData: ChannelData = new ChannelData(associatedData, spreadData);

        switch (ionChannelName) {
          case "hERG":
            apPredictInput.pIC50sIKr = pIC50s;
            apPredictInput.IKr = channelData;
            break;
          case "NaV1_5":
            apPredictInput.pIC50sINa = pIC50s;
            apPredictInput.INa = channelData;
            break;
          case "CaV1_2":
            apPredictInput.pIC50sICaL = pIC50s;
            apPredictInput.ICaL = channelData;
            break;
          case "KCNQ1":
            apPredictInput.pIC50sIKs = pIC50s;
            apPredictInput.IKs = channelData;
            break;
          case "IK1":
            apPredictInput.pIC50sIK1 = pIC50s;
            apPredictInput.IK1 = channelData;
            break;
          case "Ito":
            apPredictInput.pIC50sIto = pIC50s;
            apPredictInput.Ito = channelData;
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
        perFreqApPredictInput['metaData'] = {
          'title': groupName + '@' + pacingFrequency + 'Hz',
          'groupLevel': groupLevel,
          'pacingFrequency': pacingFrequency
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