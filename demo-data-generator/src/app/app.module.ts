import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { environment } from '../environments/environment';

import { AboutComponent } from './about/about.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PrivacyComponent } from './privacy/privacy.component';


@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    PrivacyComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [
    { provide: 'ProvidedDataService',
      useClass: environment.dataServiceImpl }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
