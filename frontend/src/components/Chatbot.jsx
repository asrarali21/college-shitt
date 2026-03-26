import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../utils/api';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: "👋 Hi! I'm ParkBot, your smart parking assistant. Ask me about availability, pricing, or best times to park!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                content: m.content
            }));

            const res = await chatWithAI({ message: userMsg, history });
            setMessages(prev => [...prev, { role: 'model', content: res.data.message }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'model', content: '❌ Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const quickQuestions = [
        'Is parking available?',
        'What are the charges?',
        'Best time to park?',
        'How to book a slot?'
    ];

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

                    {/* Quick Questions */}
                    {messages.length <= 1 && (
                        <div className="quick-questions">
                            {quickQuestions.map((q, i) => (
                                <button key={i} className="quick-q-btn" onClick={() => { setInput(q); }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={sendMessage} className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask ParkBot anything..."
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !input.trim()}>
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chatbot;
