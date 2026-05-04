// Messages/Chat Page
import { useState, useEffect } from 'react';
import { MessageSquare, Send, Inbox, SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import marketplaceService from '@/services/marketplaceService';
import { useToast } from '@/hooks/use-toast';

const MessagesPage = () => {
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const [inboxRes, sentRes] = await Promise.all([
        marketplaceService.messages.getInbox(),
        marketplaceService.messages.getSent(),
      ]);
      setInbox(inboxRes.data);
      setSent(sentRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await marketplaceService.messages.markRead(messageId);
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const MessageCard = ({ message, isSent }) => (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        setSelectedMessage(message);
        if (!isSent && !message.is_read) {
          markAsRead(message.id);
        }
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar>
              <AvatarFallback>
                {(isSent ? message.recipient_name : message.sender_name)?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                {isSent ? message.recipient_name : message.sender_name}
                {!isSent && !message.is_read && (
                  <Badge variant="default" className="text-xs">New</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {new Date(message.created_at).toLocaleString()}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-semibold text-sm mb-1">{message.subject}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
        {message.product && (
          <Badge variant="outline" className="mt-2">
            Re: {message.product_title}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-500" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            Messages
          </h1>
          <NewMessageDialog onMessageSent={fetchMessages} />
        </div>

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="inbox">
              <Inbox className="w-4 h-4 mr-2" />
              Inbox ({inbox.filter(m => !m.is_read).length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              <SendIcon className="w-4 h-4 mr-2" />
              Sent ({sent.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inbox" className="mt-6">
            {inbox.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-semibold mb-2">No messages</p>
                  <p className="text-gray-500">Your inbox is empty</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inbox.map((message) => (
                  <MessageCard key={message.id} message={message} isSent={false} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sent" className="mt-6">
            {sent.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <SendIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-semibold mb-2">No sent messages</p>
                  <p className="text-gray-500">Messages you send will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sent.map((message) => (
                  <MessageCard key={message.id} message={message} isSent={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.sender_name} • {new Date(selectedMessage?.created_at || '').toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              {selectedMessage.product && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Related to:</p>
                  <p className="font-semibold">{selectedMessage.product_title}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// New Message Dialog Component
const NewMessageDialog = ({ onMessageSent }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient_id: '',
    subject: '',
    message: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await marketplaceService.messages.send(formData);
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      setOpen(false);
      setFormData({ recipient_id: '', subject: '', message: '' });
      onMessageSent();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a message to a seller or buyer
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Recipient ID</label>
            <Input
              value={formData.recipient_id}
              onChange={(e) => setFormData({ ...formData, recipient_id: e.target.value })}
              placeholder="Enter recipient user ID"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Enter subject"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Type your message..."
              rows={6}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesPage;
