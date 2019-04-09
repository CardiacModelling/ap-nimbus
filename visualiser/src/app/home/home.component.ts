import { Component, Inject, OnInit } from '@angular/core';

import { InputParserService } from '../service/input-parser.service';
import { InputProcessorService } from '../service/input-processor.service';

/**
 * https://medium.freecodecamp.org/how-to-make-image-upload-easy-with-angular-1ed14cb2773b
 */
class ImageSnippet {
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
  selectedFile: ImageSnippet;

  constructor(@Inject('InputParserService')
                     private inputParserService: InputParserService,
              @Inject('InputProcessorService')
                     private inputProcessorService: InputProcessorService) {}

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
      this.selectedFile = new ImageSnippet(event.target.result, file);

      this.selectedFile.pending = true;

      var inputDataJSON = this.inputParserService.parseInput(this.selectedFile.src);

      if (inputDataJSON == null) {
        this.onError();
        this.content = 'Could not parse the uploaded file - JSON format required.'
      } else {
        this.onSuccess();
        this.content = JSON.stringify(this.inputProcessorService.processInput(inputDataJSON), null, 2);
      }
    });

    reader.readAsText(file);
  }
}