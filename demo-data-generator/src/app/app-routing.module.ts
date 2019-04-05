import { NgModule } from '@angular/core';
import { Router, Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PrivacyComponent } from './privacy/privacy.component';

/**
 * Navigation routes.
 * 
 * Their associated paths, matching and destination components.
 * 
 * {@link https://angular.io/guide/router}
 */
export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'about', component: AboutComponent, pathMatch: 'full' },
  { path: 'contact', component: ContactComponent, pathMatch: 'full' },
  { path: 'privacy', component: PrivacyComponent, pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

/**
 * Application routing module.
 */
export class AppRoutingModule {

  /**
   * Navigate to the 'about' page.
   * 
   * @param router Angular router.
   */
  static goToAboutPage(router: Router) : void {
    console.log("~goToAboutPage() : Invoked.");
    router.navigateByUrl('/about');
  }

  /**
   * Navigate to the 'contact' page.
   * 
   * @param router Angular router.
   */
  static goToContactPage(router: Router) : void {
    console.log("~goToContactPage() : Invoked.");
    router.navigateByUrl('/contact');
  }

  /**
   * Navigate to the 'home' page.
   * 
   * @param router Angular router.
   */
  static goToHomePage(router: Router) : void {
    console.log("~goToHomePage() : Invoked.");
    router.navigateByUrl('/');
  }

  /**
   * Navigate to the 'privacy' page.
   *
   * @param router Angular router.
   */
  static goToPrivacyPage(router: Router) : void {
    console.log("~goToPrivacyPage() : Invoked.");
    router.navigateByUrl('/privacy');
  }
}