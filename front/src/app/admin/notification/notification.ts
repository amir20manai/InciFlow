import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService, NotificationResponse } from '../../services/notification';

@Component({
  selector: 'app-notification-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationAdmin implements OnInit {
  activeTab: 'all' | 'unread' | 'read' = 'all';
  searchQuery: string = '';
  
  notifications: NotificationResponse[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications = data.map(n => ({
          ...n,
          type: this.determineType(n.message)
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement notifications:', err);
        this.errorMessage = 'Erreur lors de la récupération des notifications.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  determineType(message: string): 'critical' | 'assigned' | 'resolved' | 'info' {
    const lower = message.toLowerCase();
    if (lower.includes('critical') || lower.includes('urgent')) return 'critical';
    if (lower.includes('assigned') || lower.includes('affecté')) return 'assigned';
    if (lower.includes('resolved') || lower.includes('résolu')) return 'resolved';
    return 'info';
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get filteredNotifications(): NotificationResponse[] {
    return this.notifications.filter(n => {
      const matchesSearch = n.message.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      let matchesTab = true;
      if (this.activeTab === 'unread') matchesTab = !n.isRead;
      if (this.activeTab === 'read') matchesTab = n.isRead;

      return matchesSearch && matchesTab;
    });
  }

  markAsRead(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const item = this.notifications.find(n => n.id === id);
        if (item) item.isRead = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur mark as read:', err)
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur mark all as read:', err)
    });
  }

  setTab(tab: 'all' | 'unread' | 'read'): void {
    this.activeTab = tab;
  }
}