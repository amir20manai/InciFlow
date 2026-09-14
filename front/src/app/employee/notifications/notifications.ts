import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface AppNotification {
  id: number;
  type: 'critical' | 'assigned' | 'resolved' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class Notifications {
  activeTab: 'all' | 'unread' | 'read' = 'all';

  notifications: AppNotification[] = [
    {
      id: 1,
      type: 'critical',
      title: 'New critical incident',
      message: 'INC-2040 "VPN connection drops every 10 minutes" was reported.',
      time: '6h ago',
      read: false
    },
    {
      id: 2,
      type: 'assigned',
      title: 'Incident assigned to you',
      message: 'You have been assigned to INC-2041 by Priya Sharma.',
      time: '2h ago',
      read: false
    },
    {
      id: 3,
      type: 'resolved',
      title: 'Incident resolved',
      message: 'INC-2037 "Suspicious phishing email reported" was marked as resolved.',
      time: '1d ago',
      read: false
    },
    {
      id: 4,
      type: 'info',
      title: 'Weekly summary ready',
      message: 'Your weekly incident summary for last week is available in Statistics.',
      time: '2d ago',
      read: true
    },
    {
      id: 5,
      type: 'info',
      title: 'System maintenance scheduled',
      message: 'Scheduled maintenance will take place this Sunday at midnight.',
      time: '3d ago',
      read: true
    }
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get filteredNotifications() {
    if (this.activeTab === 'unread') return this.notifications.filter(n => !n.read);
    if (this.activeTab === 'read') return this.notifications.filter(n => n.read);
    return this.notifications;
  }

  markAsRead(id: number, event: Event) {
    event.stopPropagation();
    const item = this.notifications.find(n => n.id === id);
    if (item) item.read = true;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  setTab(tab: 'all' | 'unread' | 'read') {
    this.activeTab = tab;
  }
}