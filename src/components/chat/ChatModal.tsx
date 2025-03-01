import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getOrCreateConversation,
  getUserProfile,
  Conversation,
  Message,
} from "@/lib/chat";
import { supabase } from "@/lib/supabase";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  recipientId?: string | null;
  recipientName?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  open,
  onOpenChange,
  userId,
  recipientId = null,
  recipientName = "",
}) => {
  const { profile } = useAuth();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipient, setRecipient] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Format the timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format the date for display
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Load conversations when modal opens
  useEffect(() => {
    if (open && userId) {
      loadConversations();
      
      // Set up subscription for real-time updates
      const subscription = supabase
        .channel('messages-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          handleNewMessage
        )
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [open, userId]);
  
  // Handle direct chat opening when recipientId is provided
  useEffect(() => {
    if (open && recipientId && userId) {
      startDirectChat();
    }
  }, [open, recipientId, userId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (activeConversation) {
      markMessagesAsRead(activeConversation, userId);
    }
  }, [activeConversation, messages]);

  // Load user conversations
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const { conversations: userConversations, error } = await getUserConversations(userId);
      
      if (error) {
        console.error("Error loading conversations:", error);
        return;
      }
      
      setConversations(userConversations);
    } catch (error) {
      console.error("Error in loadConversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start a direct chat with the recipient
  const startDirectChat = async () => {
    if (!recipientId) return;
    
    setIsLoading(true);
    try {
      // Get the recipient's profile
      const { profile: recipientProfile } = await getUserProfile(recipientId);
      
      if (recipientProfile) {
        setRecipient(recipientProfile);
        
        // Get or create a conversation with this person
        const { conversationId } = await getOrCreateConversation(userId, recipientId);
        
        if (conversationId) {
          setActiveConversation(conversationId);
          loadMessages(conversationId);
        }
      }
    } catch (error) {
      console.error("Error starting direct chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const { messages: conversationMessages } = await getConversationMessages(conversationId);
      setMessages(conversationMessages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new message from real-time subscription
  const handleNewMessage = async (payload: any) => {
    // Get the new message
    const newMsg = payload.new;
    
    // If this is for our active conversation, add it to messages
    if (newMsg.conversation_id === activeConversation) {
      // Mark as read immediately if it's in the current conversation
      await markMessagesAsRead(activeConversation, userId);
      
      // Get the sender info
      const { profile: sender } = await getUserProfile(newMsg.sender_id);
      
      setMessages(prevMessages => [
        ...prevMessages,
        {
          ...newMsg,
          sender
        }
      ]);
    }
    
    // Refresh conversations to update unread counts and last messages
    loadConversations();
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!activeConversation || !userId || !newMessage.trim()) return;
    
    setIsSending(true);
    try {
      const { message } = await sendMessage({
        conversationId: activeConversation,
        senderId: userId,
        content: newMessage.trim(),
      });
      
      if (message) {
        // Clear input field
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Select a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation.id);
    setRecipient(conversation.participants?.[0] || null);
    loadMessages(conversation.id);
  };

  // Go back to conversation list
  const handleBackToList = () => {
    setActiveConversation(null);
    setRecipient(null);
    setMessages([]);
  };

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get filtered conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    const participantName = conversation.participants?.[0]?.display_name || "";
    return participantName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Fix for send button not working - update the handler to send messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[800px] p-0 gap-0">
        <div className="flex h-[600px] overflow-hidden">
          {/* Sidebar with conversations */}
          <div className={cn(
            "w-full md:w-1/3 border-r flex flex-col transition-all",
            activeConversation ? "hidden md:flex" : "flex"
          )}>
            <DialogHeader className="px-4 py-3 border-b">
              <DialogTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {isLoading && !activeConversation ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredConversations.length > 0 ? (
                <div className="divide-y">
                  {filteredConversations.map(conversation => {
                    const otherUser = conversation.participants?.[0];
                    const lastMessage = conversation.last_message;
                    
                    return (
                      <div 
                        key={conversation.id}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-muted/50 flex items-start gap-3",
                          conversation.unread_count ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        )}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          {otherUser?.avatar_url ? (
                            <AvatarImage src={otherUser.avatar_url} alt={otherUser.display_name} />
                          ) : (
                            <AvatarFallback>
                              {otherUser?.display_name?.[0] || <UserIcon className="h-6 w-6" />}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-sm truncate">
                              {otherUser?.display_name || "Unknown User"}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {lastMessage?.created_at 
                                ? formatTime(lastMessage.created_at) 
                                : formatDate(conversation.updated_at)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {lastMessage?.content || "No messages yet"}
                            </p>
                            
                            {conversation.unread_count > 0 && (
                              <Badge 
                                variant="default"
                                className="ml-2 bg-primary h-5 w-5 p-0 flex items-center justify-center rounded-full"
                              >
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground mb-2">No conversations yet</p>
                  <p className="text-xs text-muted-foreground">
                    When you engage with other poets, your conversations will appear here
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Current conversation */}
          <div className={cn(
            "w-full md:w-2/3 flex flex-col transition-all",
            activeConversation ? "flex" : "hidden md:flex"
          )}>
            {activeConversation ? (
              <>
                <div className="border-b p-3 flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="md:hidden mr-2"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  <Avatar className="h-9 w-9">
                    {recipient?.avatar_url ? (
                      <AvatarImage src={recipient.avatar_url} alt={recipient.display_name} />
                    ) : (
                      <AvatarFallback>
                        {recipient?.display_name?.[0] || recipientName?.[0] || <UserIcon className="h-5 w-5" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="ml-3">
                    <p className="font-medium text-sm">
                      {recipient?.display_name || recipientName || "Chat"}
                    </p>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isCurrentUser = message.sender_id === userId;
                        const showAvatar = 
                          index === 0 || 
                          messages[index - 1].sender_id !== message.sender_id;
                        
                        return (
                          <div 
                            key={message.id} 
                            className={cn(
                              "flex",
                              isCurrentUser ? "justify-end" : "justify-start"
                            )}
                          >
                            <div className="flex items-end gap-2 max-w-[80%]">
                              {!isCurrentUser && showAvatar && (
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  {message.sender?.avatar_url ? (
                                    <AvatarImage src={message.sender.avatar_url} alt={message.sender.display_name} />
                                  ) : (
                                    <AvatarFallback>
                                      {message.sender?.display_name?.[0] || <UserIcon className="h-4 w-4" />}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              )}
                              
                              {!isCurrentUser && !showAvatar && (
                                <div className="w-8" />
                              )}
                              
                              <div 
                                className={cn(
                                  "rounded-lg px-3 py-2 text-sm",
                                  isCurrentUser 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted"
                                )}
                              >
                                {message.content}
                                <div className="text-[10px] text-right mt-1 opacity-70">
                                  {formatTime(message.created_at)}
                                  {isCurrentUser && (
                                    <span className="ml-1">
                                      {message.is_read ? (
                                        <CheckCheck className="inline h-3 w-3" />
                                      ) : (
                                        <Check className="inline h-3 w-3" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-1">Start Conversation</h3>
                      <p className="text-sm text-muted-foreground">
                        Send a message to start the conversation
                      </p>
                    </div>
                  )}
                </ScrollArea>
                
                <div className="border-t p-3 flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button 
                    size="icon"
                    disabled={!newMessage.trim() || isSending} 
                    onClick={handleSendMessage}
                    type="button"
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                <p className="text-muted-foreground">
                  Select a conversation or start a new one to begin chatting with other poets.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;