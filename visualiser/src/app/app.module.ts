import { HttpClientModule } from '@angular/common/http';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { environment } from '../environments/environment';

import { AboutComponent } from './about/about.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ContactComponent } from './contact/contact.component';
import { DefaultInputParserServiceImpl } from './service/default-input-parser';
import { DefaultInputProcessorServiceImpl } from './service/default-input-processor';
import { HomeComponent } from './home/home.component';
import { InputParserService } from './service/input-parser.service';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { SimulationSettingsComponent } from './component/simulation-settings/simulation-settings.component';
import { PacingComponent } from './component/simulation-settings/pacing/pacing.component';
import { ModelsComponent } from './component/simulation-settings/models/models.component';
import { CompoundConcentrationsComponent } from './component/simulation-settings/compound-concentrations/compound-concentrations.component';
import { ResultsComponent } from './component/results/results.component';
import { FlotAPD50Directive } from './directive/flot-apd50.directive';
import { FlotAPD90Directive } from './directive/flot-apd90.directive';
import { FlotDeltaAPD90Directive } from './directive/flot-delta_apd90.directive';
import { FlotPeakVmDirective } from './directive/flot-peak_vm.directive';
import { FlotQNetDirective } from './directive/flot-q_net.directive';
import { FlotUpstrokeVelocityDirective } from './directive/flot-upstroke_velocity.directive';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    PrivacyComponent,
    PageNotFoundComponent,
    SimulationSettingsComponent,
    PacingComponent,
    ModelsComponent,
    CompoundConcentrationsComponent,
    ResultsComponent,
    FlotAPD50Directive,
    FlotAPD90Directive,
    FlotDeltaAPD90Directive,
    FlotPeakVmDirective,
    FlotQNetDirective,
    FlotUpstrokeVelocityDirective
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    TooltipModule.forRoot(),
  ],
  providers: [
    SimulationSettingsComponent,
    { provide: 'ApPredictConfigService',
      useClass: environment.apPredictConfigServiceImpl },
    { provide: 'InputParserService',
      useClass: environment.inputParserServiceImpl },
    { provide: 'InputProcessorService',
      useClass: environment.inputProcessorServiceImpl },
    { provide: 'SimulationService',
      useClass: environment.simulationServiceImpl },
    { provide: 'SimulationsService',
      useClass: environment.simulationsServiceImpl }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
