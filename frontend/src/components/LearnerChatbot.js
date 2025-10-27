import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

const LearnerChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hi! I'm your learning assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const quickReplies = [
    "How do I access my modules?",
    "I'm stuck on Module 2",
    "When is my next class?",
    "How to download resources?"
  ];

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      type: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      setMessages(prev => [...prev, {
        type: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("module") || lowerMessage.includes("access")) {
      return "To access your modules, go to your dashboard and click on any module card. Green means 'In Progress', yellow means 'Available', and grey means 'Locked'. Complete previous modules to unlock the next ones!";
    }
    if (lowerMessage.includes("stuck") || lowerMessage.includes("help") || lowerMessage.includes("difficult")) {
      return "I understand learning can be challenging! Try reviewing the module resources in the sidebar. You can also download the PDF guides or watch the explainer videos. If you're still stuck, your trainer will reach out to you within 24 hours.";
    }
    if (lowerMessage.includes("class") || lowerMessage.includes("schedule")) {
      return "For face-to-face classes, check your email for the schedule. Digital classes are available 24/7 - you can learn at your own pace! Your current progress shows you're doing great.";
    }
    if (lowerMessage.includes("download") || lowerMessage.includes("resource")) {
      return "Resources are available on each module page. Look for the 'Learning Resources' section on the right side. Click the download icon next to any resource to save it to your device.";
    }
    if (lowerMessage.includes("progress") || lowerMessage.includes("complete")) {
      return "You can track your progress on your dashboard. Each module shows your completion percentage. Keep going - you're making excellent progress!";
    }
    
    return "Thanks for your question! For detailed support, please contact your trainer or check the FAQ section in your course materials. Is there anything else I can help you with?";
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 z-50"
        data-testid="open-chatbot"
      >
        <MessageSquare size={28} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col" data-testid="chatbot-window">
      <CardHeader className="pb-3 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={24} />
            <CardTitle className="text-lg">Learning Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-700 h-8 w-8 p-0"
            data-testid="close-chatbot"
          >
            <X size={20} />
          </Button>
        </div>
        <p className="text-xs text-blue-100 mt-1">Ask me anything about your courses!</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.type === "bot" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-blue-600" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">{message.time}</p>
              </div>
              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 border-t bg-slate-50">
          <p className="text-xs text-slate-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(reply)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                data-testid={`quick-reply-${index}`}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
              placeholder="Type your message..."
              className="flex-1"
              data-testid="chat-input"
            />
            <Button
              onClick={() => handleSendMessage(inputMessage)}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="send-message"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearnerChatbot;
