import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

interface Incident {
  id: string;
  title: string;
  category: string;
  department: string;
  reporterName: string;
  reporterInitials: string;
  reporterColor: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  updatedAt: string;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  // User Info
  userName: string = 'Alex Morgan';
  userRole: string = 'Administrator';
  userInitials: string = 'AM';

  // Stats Data
  stats = [
    { title: 'Total Incidents', count: 8, change: '+12%', isPositive: true, type: 'total' },
    { title: 'Open', count: 2, change: '-4%', isPositive: false, type: 'open' },
    { title: 'In Progress', count: 2, change: '+8%', isPositive: true, type: 'progress' },
    { title: 'Resolved', count: 3, change: '+18%', isPositive: true, type: 'resolved' }
  ];

  // Incidents List (Table)
  incidents: Incident[] = [
    {
      id: 'INC-2041',
      title: 'Laptop will not boot after OS update',
      category: 'Hardware',
      department: 'Marketing',
      reporterName: 'Priya Sharma',
      reporterInitials: 'PS',
      reporterColor: '#3b82f6',
      priority: 'High',
      status: 'In Progress',
      updatedAt: '3h ago'
    },
    {
      id: 'INC-2040',
      title: 'VPN connection drops every 10 minutes',
      category: 'Network',
      department: 'Finance',
      reporterName: 'Dana Whitfield',
      reporterInitials: 'DW',
      reporterColor: '#2563eb',
      priority: 'Critical',
      status: 'Open',
      updatedAt: '8h ago'
    },
    {
      id: 'INC-2039',
      title: 'Request access to Salesforce dashboard',
      category: 'Access',
      department: 'Marketing',
      reporterName: 'Priya Sharma',
      reporterInitials: 'PS',
      reporterColor: '#3b82f6',
      priority: 'Low',
      status: 'Resolved',
      updatedAt: '22h ago'
    },
    {
      id: 'INC-2038',
      title: 'Conference room A/C leaking water',
      category: 'Facilities',
      department: 'Facilities',
      reporterName: 'Hannah Kim',
      reporterInitials: 'HK',
      reporterColor: '#0284c7',
      priority: 'Medium',
      status: 'In Progress',
      updatedAt: '6h ago'
    },
    {
      id: 'INC-2037',
      title: 'Suspicious phishing email reported',
      category: 'Security',
      department: 'IT Operations',
      reporterName: 'Alex Morgan',
      reporterInitials: 'AM',
      reporterColor: '#2563eb',
      priority: 'Critical',
      status: 'Resolved',
      updatedAt: '1d ago'
    },
    {
      id: 'INC-2036',
      title: 'Slack notifications not arriving on mobile',
      category: 'Software',
      department: 'Marketing',
      reporterName: 'Priya Sharma',
      reporterInitials: 'PS',
      reporterColor: '#3b82f6',
      priority: 'Medium',
      status: 'Open',
      updatedAt: '2d ago'
    }
  ];

  // Category Distribution Bar Chart Data
  categories = [
    { name: 'Hardware', count: 4, height: '70%', color: '#2563eb' },
    { name: 'Software', count: 5, height: '90%', color: '#0ea5e9' },
    { name: 'Network', count: 3, height: '55%', color: '#10b981' },
    { name: 'Security', count: 2, height: '35%', color: '#ef4444' },
    { name: 'Facilities', count: 2, height: '40%', color: '#f59e0b' },
    { name: 'Access', count: 1, height: '25%', color: '#a855f7' }
  ];

  // Notifications Sidebar
  notifications: NotificationItem[] = [
    {
      id: 1,
      title: 'Incident resolved',
      message: 'INC-2041 "Laptop will not boot after OS update" was resolved by Alex Morgan.',
      time: '55m ago'
    },
    {
      id: 2,
      title: 'Incident resolved',
      message: 'INC-2038 "Conference room A/C leaking water" was resolved by Alex Morgan.',
      time: '55m ago'
    },
    {
      id: 3,
      title: 'New critical incident',
      message: 'INC-2040 "VPN connection drops every 10 minutes" was reported.',
      time: '8h ago'
    },
    {
      id: 4,
      title: 'Incident assigned to you',
      message: 'You have been assigned to INC-2041 by Priya Sharma.',
      time: '4h ago'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Récupération mta3 el-user connecte
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.fullName) {
        this.userName = parsed.fullName;
        this.userInitials = this.getInitials(parsed.fullName);
      }
      if (parsed.role) {
        this.userRole = parsed.role.charAt(0).toUpperCase() + parsed.role.slice(1);
      }
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  goToSettings(): void {
    this.router.navigate(['/profile-settings']);
  }
}