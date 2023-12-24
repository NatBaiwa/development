import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROOT_MENU } from './option.data';
import { SharedModule } from 'src/app/shared/shared.module';
import { Menu } from 'src/app/shared/interface/menu.interface';

@Component({
  standalone: true,
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
  imports: [SharedModule],
})
export class OptionComponent {
  /* -------------------------------------------------------------------------- */
  /*                                   Inject                                   */
  /* -------------------------------------------------------------------------- */
  private router = inject(Router);

  /* -------------------------------------------------------------------------- */
  /*                                  Functions                                 */
  /* -------------------------------------------------------------------------- */
  navigateTo(router: string) {
    localStorage.setItem('isPageLoaded', 'true');
    this.router.navigate([router]);
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Variables                                 */
  /* -------------------------------------------------------------------------- */
  menu: Menu[] = ROOT_MENU;
}
