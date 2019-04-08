import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';

/**
 * Angular application root component.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'AP-Nimbus - visualiser';

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
   * Navigate to the 'home' page.
   */
  viewHomePage() : void {
    AppRoutingModule.goToHomePage(this.router);
  }
 
  /**
   * Navigate to the 'privacy' page.
   */
  viewPrivacyPage() : void {
    AppRoutingModule.goToPrivacyPage(this.router);
  }
}