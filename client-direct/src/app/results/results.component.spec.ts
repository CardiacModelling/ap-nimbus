import { HttpClient } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { of } from 'rxjs';

import { AppredictRestService } from '../appredict-rest.service';
import { ResultsComponent } from './results.component';

describe('ResultsComponent', () => {
  let component: ResultsComponent;

  let apPredictRestService: jasmine.SpyObj<AppredictRestService>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let fixture: ComponentFixture<ResultsComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const aSpy = jasmine.createSpy('AppredictRestService');
    const hSpy = jasmine.createSpyObj('HttpClient', ['get']);
    const rSpy = jasmine.createSpy('Router');

    TestBed.configureTestingModule({
      declarations: [ ResultsComponent ],
      imports: [ BrowserAnimationsModule,
                 NgxChartsModule ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: 1 } } } },
        { provide: AppredictRestService, useValue: aSpy },
        { provide: HttpClient, useValue: hSpy },
        { provide: Router, useValue: rSpy }
      ]
    })
    .compileComponents();

    apPredictRestService = TestBed.get(AppredictRestService);
    httpClientSpy = TestBed.get(HttpClient);
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
