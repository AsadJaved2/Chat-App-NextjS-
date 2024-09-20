'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3005'); 

export default function ChatPage() {
  const [messages, setMessages] = useState<{ userId: string; message: string; timestamp: Date }[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server:', socket.id);
    });

    socket.on('message', (message: { userId: string; message: string; timestamp: Date }) => {
      setMessages((prev) => [...prev, message]);
      console.log('Received message:', message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('disconnect');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
        const message = {
            userId: socket.id, 
            message: input,     
        };
        console.log('Sending message:', message); 
        socket.emit('newMessage', message); 
        setInput(''); 
    }
};
  return (
    <main className="flex flex-col h-screen">
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <div className="text-sm font-semibold">{msg.userId}</div>
            <div className="text-gray-600">{msg.message}</div>
            <div className="text-xs text-gray-400">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-100 flex">
        <input
          type="text"
          className="flex-grow border rounded-l p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className={`bg-blue-500 text-white p-2 rounded-r ${input.trim() === '' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={input.trim() === ''}
        >
          Send
        </button>
      </div>
    </main>
  );
}
