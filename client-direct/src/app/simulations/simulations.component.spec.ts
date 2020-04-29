import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SimulationsComponent } from './simulations.component';

describe('SimulationsComponent', () => {
  let component: SimulationsComponent;

  let fixture: ComponentFixture<SimulationsComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const rSpy = jasmine.createSpy('Router');

    TestBed.configureTestingModule({
      declarations: [ SimulationsComponent ],
      providers: [
        { provide: Router, useValue: rSpy }
      ]
    })
    .compileComponents();

    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
