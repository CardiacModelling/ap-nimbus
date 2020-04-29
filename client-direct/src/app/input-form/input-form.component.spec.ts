import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { AppredictRestService } from '../appredict-rest.service';
import { InputFormComponent } from './input-form.component';

describe('InputFormComponent', () => {
  let component: InputFormComponent;

  let apPredictRestService: jasmine.SpyObj<AppredictRestService>;
  let fixture: ComponentFixture<InputFormComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const aSpy = jasmine.createSpy('AppredictRestService');
    const rSpy = jasmine.createSpy('Router');

    TestBed.configureTestingModule({
      declarations: [ InputFormComponent ],
      imports: [ BrowserAnimationsModule,
                 MatCheckboxModule,
                 MatInputModule,
                 MatSelectModule,
                 ReactiveFormsModule ],
      providers: [
        { provide: AppredictRestService, useValue: aSpy },
        { provide: Router, useValue: rSpy }
      ]
    })
    .compileComponents();

    apPredictRestService = TestBed.get(AppredictRestService);
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
