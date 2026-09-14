import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistiques.html',
  styleUrls: ['./statistiques.css']
})
export class Statistiques {
  globalSearch: string = '';

  // Top Metrics Data
  metrics = [
    { title: 'Total Incidents', value: '8', trend: '+12%', isPositive: true, iconBg: 'rgba(37, 99, 235, 0.15)', iconColor: '#3b82f6' },
    { title: 'Avg. Resolution', value: '4.2h', trend: '-6%', isPositive: false, iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#f59e0b' },
    { title: 'Resolved', value: '3', trend: '+18%', isPositive: true, iconBg: 'rgba(16, 185, 129, 0.15)', iconColor: '#10b981' },
    { title: 'SLA Compliance', value: '96%', trend: '+3%', isPositive: true, iconBg: 'rgba(14, 165, 233, 0.15)', iconColor: '#0ea5e9' }
  ];

  // Incidents by Category Chart Data
  categoryStats = [
    { name: 'Hardware', height: '60%', color: '#2563eb' },
    { name: 'Software', height: '85%', color: '#0ea5e9' },
    { name: 'Network', height: '45%', color: '#10b981' },
    { name: 'Security', height: '25%', color: '#ef4444' },
    { name: 'Facilities', height: '35%', color: '#f59e0b' },
    { name: 'Access', height: '20%', color: '#8b5cf6' }
  ];

  // Status Breakdown Data
  statusBreakdown = [
    { label: 'Open', count: 2, color: '#2563eb' },
    { label: 'In Progress', count: 2, color: '#0ea5e9' },
    { label: 'Resolved', count: 3, color: '#10b981' },
    { label: 'Rejected', count: 1, color: '#64748b' }
  ];

  // Weekly Trend Chart Data
  weeklyTrend = [
    { day: 'Mon', height: '45%' },
    { day: 'Tue', height: '75%' },
    { day: 'Wed', height: '55%' },
    { day: 'Thu', height: '90%' },
    { day: 'Fri', height: '65%' },
    { day: 'Sat', height: '30%' },
    { day: 'Sun', height: '25%' }
  ];
}