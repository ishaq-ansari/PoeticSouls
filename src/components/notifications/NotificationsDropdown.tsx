import React, { useState, useEffect } from "react";
import { Bell, Check, Heart, MessageCircle, Loader2, User } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Notification, 
  getNotifications, 
  markAllNotificationsAsRead, 
  getUnreadNotificationCount 
} from "@/lib/notifications";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationsDropdownProps {
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationsDropdown = ({ 
  onNotificationClick 
}: NotificationsDropdownProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { notifications } = await getNotifications(user.id);
      setNotifications(notifications || []);
      
      // Also update unread count
      const { count } = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch notifications immediately
      fetchNotifications();
      
      // Set up interval to check for new notifications
      const intervalId = setInterval(() => {
        getUnreadNotificationCount(user.id).then(({ count }) => {
          setUnreadCount(count);
          // If dropdown is open, refresh the notifications
          if (open) {
            fetchNotifications();
          }
        });
      }, 60000); // Check every minute
      
      return () => clearInterval(intervalId);
    }
  }, [user, open]);

  const handleDropdownOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && user) {
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    await markAllNotificationsAsRead(user.id);
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, is_read: true }))
    );
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    setOpen(false);
    onNotificationClick?.(notification);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const seconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    
    return 'Just now';
  };

  // Generate notification message based on type
  const renderNotificationContent = (notification: Notification) => {
    const senderName = notification.sender?.display_name || 'Someone';
    const poemTitle = notification.poem?.title || 'your poem';
    
    switch (notification.type) {
      case 'like':
        return (
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
            <span>
              <strong>{senderName}</strong> liked <strong>{poemTitle}</strong>
            </span>
          </div>
        );
      case 'comment':
        return (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <span>
              <strong>{senderName}</strong> commented on <strong>{poemTitle}</strong>
              {notification.content ? `: "${notification.content.substring(0, 30)}${notification.content.length > 30 ? '...' : ''}"` : ''}
            </span>
          </div>
        );
      case 'follow':
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-500" />
            <span><strong>{senderName}</strong> followed you</span>
          </div>
        );
      default:
        return <span>{notification.content}</span>;
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0 rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifications
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs flex items-center gap-1" 
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3" /> Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-3 cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      {notification.sender?.avatar_url ? (
                        <AvatarImage src={notification.sender.avatar_url} alt={notification.sender.display_name} />
                      ) : (
                        <AvatarFallback>
                          {notification.sender?.display_name?.[0] || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="text-sm">
                        {renderNotificationContent(notification)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 self-start mt-1.5"></div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;