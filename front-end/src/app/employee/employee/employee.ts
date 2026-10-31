import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    RouterOutlet, Sidebar ],
  templateUrl: './employee.html',
  styleUrl: './employee.css'
})
export class Employee {

}
