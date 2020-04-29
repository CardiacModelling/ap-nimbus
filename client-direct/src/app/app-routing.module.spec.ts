import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { routes } from './app-routing.module';

import { AppRoutingModule } from './app-routing.module';

import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { InputComponent } from './input/input.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ResultsComponent } from './results/results.component';
import { SimulationsComponent } from './simulations/simulations.component';

describe('AppRoutingModule', () => {
  let appRoutingModule: AppRoutingModule;
  let location: Location;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AboutComponent,
        ContactComponent,
        InputComponent,
        PageNotFoundComponent,
        PrivacyComponent,
        ResultsComponent,
        SimulationsComponent
      ],
      imports: [ RouterTestingModule.withRoutes(routes) ],
      providers: [ Location ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();

    appRoutingModule = new AppRoutingModule();

    router = TestBed.get(Router);
    location = TestBed.get(Location);

  });

  it('should create an instance', () => {
    expect(appRoutingModule).toBeTruthy();
  });

  it('navigate to "" redirects you to /simulations', fakeAsync(() => {
    router.navigateByUrl('');
    tick();
    expect(location.path()).toBe('/simulations');
  }));

  // TODO : Find a way to test the "Page not found" routing!
  it('navigate to "about" redirects you to /about', fakeAsync(() => {
    router.navigateByUrl('about');
    tick();
    expect(location.path()).toBe('/about');
  }));

  it('navigate to "results/1" redirects you to /results', fakeAsync(() => {
    router.navigateByUrl('results/1');
    tick();
    expect(location.path()).toBe('/results/1');
  }));

  it('navigate to "simulations" redirects you to /simulations', fakeAsync(() => {
    router.navigateByUrl('simulations');
    tick();
    expect(location.path()).toBe('/simulations');
  }));
});
