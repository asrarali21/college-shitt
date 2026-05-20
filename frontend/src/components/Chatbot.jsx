import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../utils/api';



    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {/* Toggle Button */}
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '🤖'}
                {!isOpen && <span className="chatbot-label">ParkBot AI</span>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <span className="chatbot-avatar">🤖</span>
                            <div>
                                <h4>ParkBot AI</h4>
                                <span className="chatbot-status">Powered by Gemini</span>
                            </div>
                        </div>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role}`}>
                                {msg.role === 'model' && <span className="msg-avatar">🤖</span>}
                                <div className="msg-bubble">{msg.content}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message model">
                                <span className="msg-avatar">🤖</span>
                                <div className="msg-bubble typing">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>


export default Chatbot;
