import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebarcomponent } from '../sidebar/sidebar'; // 👈 Importi el-class Sidebar mta3 el-admin direct mel-dossier mta3ha

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, Sidebarcomponent ], // 👈 Importina el-Sidebar component mta3 el-admin hna
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
}