import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';

/**
 * Angular application root component.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent {
  title = 'AP-Nimbus';

  /**
   * Initialising constructor.
   * 
   * @param router Routing mechanism.
   */
  constructor(private router: Router) { }

  /**
   * Navigate to the 'about' page.
   */
  viewAboutPage() : void {
    AppRoutingModule.goToAboutPage(this.router);
  }

  /**
   * Navigate to the 'contact' page.
   */
  viewContactPage() : void {
    AppRoutingModule.goToContactPage(this.router);
  }

  /**
   * Navigate to the 'privacy' page.
   */
  viewPrivacyPage() : void {
    AppRoutingModule.goToPrivacyPage(this.router);
  }

  /**
   * Navigate to the 'simulations' page.
   */
  viewSimulationsPage() : void {
    AppRoutingModule.goToSimulationsPage(this.router);
  }
}