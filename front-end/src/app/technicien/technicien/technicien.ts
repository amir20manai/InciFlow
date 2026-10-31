import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-technicien',
  standalone: true,
  imports: [ 
    RouterOutlet, Sidebar ],
  templateUrl: './technicien.html',
  styleUrl: './technicien.css',
})
export class Technicien {}
