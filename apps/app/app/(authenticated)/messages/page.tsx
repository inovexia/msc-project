"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { Send, MessageSquare, Clock, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "accountant";
  content: string;
  timestamp: string;
  read: boolean;
}

interface AccountantInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Mock data - Single accountant assigned to this client
const assignedAccountant: AccountantInfo = {
  id: "acc-1",
  name: "John Doe",
  email: "sarah.johnson@accounting.com",
  avatar: undefined,
};

const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "acc-1",
    senderName: "John Doe",
    senderRole: "accountant",
    content: "Hi! I need your Q3 financial documents for the tax filing.",
    timestamp: "2025-11-01T09:00:00",
    read: true,
  },
  {
    id: "msg-2",
    senderId: "client-1",
    senderName: "You",
    senderRole: "client",
    content: "Sure, I'll upload them today. Do you need anything specific?",
    timestamp: "2025-11-01T09:15:00",
    read: true,
  },
  {
    id: "msg-3",
    senderId: "acc-1",
    senderName: "John Doe",
    senderRole: "accountant",
    content:
      "Yes, please include bank statements, invoices, and receipts from July to September.",
    timestamp: "2025-11-01T09:20:00",
    read: true,
  },
  {
    id: "msg-4",
    senderId: "client-1",
    senderName: "You",
    senderRole: "client",
    content: "Perfect! I've uploaded all the documents to the portal.",
    timestamp: "2025-11-02T14:30:00",
    read: true,
  },
  {
    id: "msg-5",
    senderId: "acc-1",
    senderName: "John Doe",
    senderRole: "accountant",
    content: "Great! I'll review them today and get back to you.",
    timestamp: "2025-11-02T15:00:00",
    read: true,
  },
  {
    id: "msg-6",
    senderId: "acc-1",
    senderName: "John Doe",
    senderRole: "accountant",
    content:
      "I've reviewed your Q3 documents. Everything looks good! I'll proceed with the tax filing.",
    timestamp: "2025-11-03T14:30:00",
    read: false,
  },
];

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const currentUserId = "client-1"; // This would come from auth
  const currentUserRole = "client"; // This would come from auth

  const [messages, setMessages] = React.useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = React.useState("");
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Get unread message count
  const unreadCount = React.useMemo(() => {
    return messages.filter((msg) => !msg.read && msg.senderId !== currentUserId)
      .length;
  }, [messages, currentUserId]);

  // Sort messages by timestamp
  const sortedMessages = React.useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [messages]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [sortedMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: "You",
      senderRole: currentUserRole as "client" | "accountant",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      setMessages(messages.filter((msg) => msg.id !== messageId));
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 48) {
      return (
        "Yesterday " +
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Messages</h1>
              <p className="text-muted-foreground">
                Communicate with your accountant
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold">
                  {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="h-[calc(100vh-250px)] flex flex-col">
          {/* Conversation Header - Accountant Info */}
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={assignedAccountant.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(assignedAccountant.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {assignedAccountant.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your Accountant • {assignedAccountant.email}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
              {sortedMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No messages yet
                    </h3>
                    <p className="text-muted-foreground">
                      Start a conversation with your accountant
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedMessages.map((message) => {
                    const isOwnMessage = message.senderId === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isOwnMessage ? "order-2" : "order-1"
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-1">
                            {!isOwnMessage && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={assignedAccountant.avatar} />
                                <AvatarFallback className="text-xs bg-primary/20">
                                  {getInitials(assignedAccountant.name)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">
                                  {isOwnMessage
                                    ? "You"
                                    : assignedAccountant.name}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <div
                                className={`rounded-lg p-3 ${
                                  isOwnMessage
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                            {isOwnMessage && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 flex-shrink-0"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteMessage(message.id)
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder={`Type your message to ${assignedAccountant.name}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-[60px] max-h-[120px] resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
