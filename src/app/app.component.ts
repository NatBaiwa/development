import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <button
      style="position: absolute; top: 40px; right: 20px; width: 30px; height: 30px; border: none; z-index: 999;"
      mat-raised-button
      color="primary"
      (click)="toggleFullscreen()"
    ></button>
    <router-outlet></router-outlet>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  /* -------------------------------------------------------------------------- */
  /*                                  Variables                                 */
  /* -------------------------------------------------------------------------- */
  isFullscreen = false;

  /* -------------------------------------------------------------------------- */
  /*                                 Life Circle                                */
  /* -------------------------------------------------------------------------- */
  ngOnInit(): void {}

  /* -------------------------------------------------------------------------- */
  /*                                  Functions                                 */
  /* -------------------------------------------------------------------------- */
  toggleFullscreen() {
    const element = document.documentElement;
    if (!this.isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    this.isFullscreen = !this.isFullscreen;
  }
}
