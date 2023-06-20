import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Replace with your server URL

function Snitches() {
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Join the room when the component mounts
        socket.emit('join', room);

        // Cleanup function to leave the room when the component unmounts
        return () => {
            socket.emit('leave', room);
        };
    }, [room]);

    useEffect(() => {
        // Listen for chat messages
        socket.on('chatMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Cleanup function to remove the chat message listener
        return () => {
            socket.off('chatMessage');
        };
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() !== '') {
            socket.emit('chatMessage', room, message);
            setMessage('');
        }
    };

    return (
        <div>
            <h1>Room Chat</h1>
            <input
                type="text"
                placeholder="Enter a room name"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default Snitches;
