import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ AppComponent ],
      providers: [ ]
    }).compileComponents();

    router = TestBed.get(Router);
  }));

  it('should navigate to about', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    const spy = spyOn(router, 'navigateByUrl');
    app.viewAboutPage();

    const url = spy.calls.first().args[0];
    expect(url).toBe('/about');
  }));

  it('should navigate to contact', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    const spy = spyOn(router, 'navigateByUrl');
    app.viewContactPage();

    const url = spy.calls.first().args[0];
    expect(url).toBe('/contact');
  }));

  it('should navigate to privacy', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    const spy = spyOn(router, 'navigateByUrl');
    app.viewPrivacyPage();

    const url = spy.calls.first().args[0];
    expect(url).toBe('/privacy');
  }));

  it('should navigate to simulations', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    const spy = spyOn(router, 'navigateByUrl');
    app.viewSimulationsPage();

    const url = spy.calls.first().args[0];
    expect(url).toBe('/simulations');
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    expect(app).toBeTruthy();
  });

  it(`should have as title 'AP-Nimbus'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    expect(app.title).toEqual('AP-Nimbus');
  });
});