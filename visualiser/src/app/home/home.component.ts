import { Component, Inject, OnInit } from '@angular/core';

import { ImageService } from './service/image.service';

class ImageSnippet {
    constructor(public src: string, public file: File) {}
  }

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  selectedFile: ImageSnippet;

  constructor(private imageService: ImageService){}

  ngOnInit(): void {}

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {

      this.selectedFile = new ImageSnippet(event.target.result, file);

      this.imageService.uploadImage(this.selectedFile.file).subscribe((res) => {},(err) => {});
    });

    reader.readAsDataURL(file);
  }
}