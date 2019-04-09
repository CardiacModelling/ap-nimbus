import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

/**
 * https://medium.freecodecamp.org/how-to-make-image-upload-easy-with-angular-1ed14cb2773b
 */

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private httpClient: HttpClient) {}

  public uploadImage(image: File): Observable<any> {
    const formData = new FormData();

    formData.append('image', image);

    return this.httpClient.post('/api/v1/image-upload', formData);
  }
}
