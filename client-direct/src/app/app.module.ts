import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AboutComponent } from './about/about.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CacheBashingInterceptor } from './interceptor/cache-bashing-interceptor';
import { ContactComponent } from './contact/contact.component';
import { InputComponent } from './input/input.component';
import { InputFormComponent } from './input-form/input-form.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ResultsComponent } from './results/results.component';
import { SimulationsComponent } from './simulations/simulations.component';

import { EnvServiceProvider } from './env.service.provider';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { environment } from '../environments/environment';

/**
 * Angular application module.
 */
@NgModule({
  declarations: [
    AppComponent,
    ResultsComponent,
    InputComponent,
    SimulationsComponent,
    AboutComponent,
    ContactComponent,
    PrivacyComponent,
    InputFormComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    TooltipModule.forRoot()
  ],
  providers: [
    EnvServiceProvider,
    { provide: HTTP_INTERCEPTORS,
      useClass: CacheBashingInterceptor,
      multi: true},
    { provide: 'ProvidedSimulationService',
      useClass: environment.simulationServiceImpl }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
