import { NgModule } from '@angular/core';
import { Router, Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { InputComponent } from './input/input.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ResultsComponent } from './results/results.component';
import { SimulationsComponent } from './simulations/simulations.component';

/**
 * Navigation routes.
 *
 * Their associated paths, matching and destination components.
 *
 * {@link https://angular.io/guide/router}
 */
export const routes: Routes = [
  { path: '', redirectTo: '/simulations', pathMatch: 'full' },
  { path: 'about', component: AboutComponent, pathMatch: 'full' },
  { path: 'contact', component: ContactComponent, pathMatch: 'full' },
  { path: 'input', component: InputComponent, pathMatch: 'full' },
  { path: 'privacy', component: PrivacyComponent, pathMatch: 'full' },
  { path: 'results/:id', component: ResultsComponent, pathMatch: 'prefix' },
  { path: 'simulations', component: SimulationsComponent, pathMatch: 'full' },
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
  static goToAboutPage(router: Router) {
    router.navigateByUrl('/about');
  }

  /**
   * Navigate to the 'contact' page.
   *
   * @param router Angular router.
   */
  static goToContactPage(router: Router) {
    router.navigateByUrl('/contact');
  }

  /**
   * Navigate to the simulation input page.
   *
   * @param router Angular router.
   */
  static goToInputPage(router: Router) {
    router.navigateByUrl('/input');
  }

  /**
   * Navigate to the 'privacy' page.
   *
   * @param router Angular router.
   */
  static goToPrivacyPage(router: Router) : void {
    router.navigateByUrl('/privacy');
  }

  /**
   * Navigate to the simulations page.
   *
   * @param router Angular router.
   */
  static goToSimulationsPage(router: Router) : void {
    router.navigateByUrl('/simulations');
  }

  /**
   * Navigate to the simulation results page.
   *
   * @param router Angular router.
   * @param simulationId Simulation identifier.
   */
  static goToResultsPage(router: Router, simulationId: string) {
    router.navigateByUrl('/results/' + simulationId);
  }
}
