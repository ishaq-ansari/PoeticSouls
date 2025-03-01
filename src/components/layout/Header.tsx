import React, { useState } from "react";
import {
  Moon,
  Sun,
  PenSquare,
  User,
  LogOut,
  Settings,
  BookMarked,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";
import { Notification } from "@/lib/notifications";

interface HeaderProps {
  isAuthenticated?: boolean;
  username?: string;
  userAvatar?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  onWritePoemClick?: () => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onSignOutClick?: () => void;
  onEditProfileClick?: () => void;
  onMyPoemsClick?: () => void;
  onBookmarksClick?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onChatClick?: () => void;
}

const Header = ({
  isAuthenticated = false,
  username = "Guest",
  userAvatar = "",
  activeTab = "feed",
  onTabChange = () => {},
  onThemeToggle = () => {},
  isDarkMode = false,
  onWritePoemClick = () => {},
  onSignInClick = () => {},
  onSignUpClick = () => {},
  onSignOutClick = () => {},
  onEditProfileClick = () => {},
  onMyPoemsClick = () => {},
  onBookmarksClick = () => {},
  onNotificationClick = () => {},
  onChatClick = () => {},
}: HeaderProps) => {
  const { profile } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use the display name from the profile if available, otherwise fall back to passed username
  const displayName = profile?.display_name || username;

  const handleTabChange = (value: string) => {
    onTabChange(value);
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
  };

  return (
    <header className="w-full h-20 px-4 md:px-8 flex items-center justify-between border-b bg-background dark:bg-gray-900">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-serif font-bold text-primary dark:text-white">
          Poetic Souls
        </h1>
      </div>

      <div className="flex-1 max-w-2xl mx-8 hidden md:block">
        <Tabs
          defaultValue="feed"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="my-poems" disabled={!isAuthenticated}>
              My Poems
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4" />
          <Switch
            checked={isDarkMode}
            onCheckedChange={onThemeToggle}
            aria-label="Toggle theme"
          />
          <Moon className="h-4 w-4" />
        </div>

        {isAuthenticated && (
          <>
            <NotificationsDropdown onNotificationClick={handleNotificationClick} />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onChatClick}
              className="relative"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </>
        )}

        <Button
          onClick={onWritePoemClick}
          className="hidden md:flex items-center gap-2"
        >
          <PenSquare className="h-4 w-4" />
          Write Poem
        </Button>

        {isAuthenticated ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {userAvatar ? (
                    <AvatarImage src={userAvatar} alt={displayName} />
                  ) : (
                    <AvatarFallback>{displayName[0]}</AvatarFallback>
                  )}
                </Avatar>
                <span className="hidden md:inline">{displayName}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <div className="grid gap-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-xl font-medium">Account</h2>
                  <Avatar className="w-20 h-20">
                    {userAvatar ? (
                      <AvatarImage src={userAvatar} alt={displayName} />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {displayName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p className="text-lg">{displayName}</p>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-start gap-2"
                    onClick={() => {
                      setDialogOpen(false);
                      onEditProfileClick();
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-start gap-2"
                    onClick={() => {
                      setDialogOpen(false);
                      onMyPoemsClick();
                    }}
                  >
                    <PenSquare className="h-4 w-4" />
                    My Poems
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-start gap-2"
                    onClick={() => {
                      setDialogOpen(false);
                      onBookmarksClick();
                    }}
                  >
                    <BookMarked className="h-4 w-4" />
                    Bookmarks
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full flex items-center justify-start gap-2"
                    onClick={() => {
                      setDialogOpen(false);
                      onSignOutClick();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onSignInClick}>
              Sign In
            </Button>
            <Button onClick={onSignUpClick}>Sign Up</Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
