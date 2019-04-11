import { Component, Inject, OnInit } from '@angular/core';

import { InputParserService } from '../service/input-parser.service';
import { InputProcessorService } from '../service/input-processor.service';
import { SimulationsService } from '../service/simulations.service';

/**
 * https://medium.freecodecamp.org/how-to-make-image-upload-easy-with-angular-1ed14cb2773b
 */
class JSONSnippet {
  pending: boolean = false;
  status: string = 'init';

  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  selectedFile: JSONSnippet;

  processedInputData: object;
  showResults: boolean = false;

  constructor(@Inject('InputParserService')
                     private inputParserService: InputParserService,
              @Inject('InputProcessorService')
                     private inputProcessorService: InputProcessorService,
              @Inject('SimulationsService')
                     private simulationsService: SimulationsService) {}

  ngOnInit(): void {}

  private onSuccess() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'ok';
  }

  private onError() {
    this.selectedFile.pending = false;
    this.selectedFile.status = 'fail';
    this.selectedFile.src = '';
  }

  processJSON(jsonInput: any) {
    this.showResults = false;

    const file: File = jsonInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new JSONSnippet(event.target.result, file);

      this.selectedFile.pending = true;

      const inputData = this.inputParserService.parseInput(this.selectedFile.src);

      if (inputData == null || inputData['data'] === undefined) {
        this.onError();
      } else {
        this.onSuccess();
        this.processedInputData = this.inputProcessorService.processInput(inputData);
      }
    });

    reader.readAsText(file);
  }

  public runSimulations(simulationsInput: object) {
    this.showResults = true;
    simulationsInput['assay'] = this.processedInputData['assay'];

    this.simulationsService.runSimulations(simulationsInput)
  }
}