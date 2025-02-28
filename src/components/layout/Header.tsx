import React, { useState } from "react";
import { Moon, Sun, PenSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

interface HeaderProps {
  isAuthenticated?: boolean;
  username?: string;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  onWritePoemClick?: () => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

const Header = ({
  isAuthenticated = false,
  username = "Guest",
  onThemeToggle = () => {},
  isDarkMode = false,
  onWritePoemClick = () => {},
  onSignInClick = () => {},
  onSignUpClick = () => {},
}: HeaderProps) => {
  const [activeTab, setActiveTab] = useState("feed");

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
          onValueChange={setActiveTab}
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

        <Button
          onClick={onWritePoemClick}
          className="hidden md:flex items-center gap-2"
          disabled={!isAuthenticated}
        >
          <PenSquare className="h-4 w-4" />
          Write Poem
        </Button>

        {isAuthenticated ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{username}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <div className="grid gap-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-xl font-medium">Account</h2>
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-lg">{username}</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => console.log("Edit Profile clicked")}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => console.log("My Poems clicked")}
                  >
                    My Poems
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => console.log("Bookmarks clicked")}
                  >
                    Bookmarks
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => console.log("Sign Out clicked")}
                  >
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
