import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logged-area',
  standalone: true,
  templateUrl: './logged-area.component.html',
  styleUrls: ['./logged-area.component.css']
})
export class LoggedAreaComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
