import { Component, Inject, OnInit } from '@angular/core';

import { InputParserService } from '../service/input-parser.service';
import { InputProcessorService } from '../service/input-processor.service';
import { SimulationSettingsComponent } from '../component/simulation-settings/simulation-settings.component';

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

  content: string;
  selectedFile: JSONSnippet;

  processedInputData: object;

  constructor(@Inject('InputParserService')
                     private inputParserService: InputParserService,
              @Inject('InputProcessorService')
                     private inputProcessorService: InputProcessorService,
              private simulationSettingsComponent: SimulationSettingsComponent) {}

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
    const file: File = jsonInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new JSONSnippet(event.target.result, file);

      this.selectedFile.pending = true;

      var inputData = this.inputParserService.parseInput(this.selectedFile.src);

      if (inputData == null) {
        this.onError();
        this.content = 'Could not parse the uploaded file - JSON format required.'
      } else {
        this.onSuccess();
        this.processedInputData = this.inputProcessorService.processInput(inputData);
        this.content = JSON.stringify(this.processedInputData, null, 2);

        // Redraw the simulation settings based on processed input data.
        //this.simulationSettingsComponent.redraw(this.processedInputData);
      }
    });

    reader.readAsText(file);
  }
}