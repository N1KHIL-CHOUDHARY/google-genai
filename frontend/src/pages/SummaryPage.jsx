import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiCopy } from 'react-icons/fi';
import { documentService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import TypingMessage from '../components/TypingMessage';

const SummaryPage = () => {
    const { fileId } = useParams();
    const { user } = useAuth();
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [isAiTyping, setIsAiTyping] = useState(false);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!fileId) return;
            setLoading(true);
            setError('');
            try {
                const result = await documentService.getSummary(fileId);
                if (result.success) {
                    setSummaryData(result.data.content); 
                    setChatMessages([{ sender: 'ai', text: `I have analyzed this document. Ask me anything.` }]);
                } else {
                    setError(result.error || 'Failed to load document summary.');
                }
            } catch (err) {
                setError('An error occurred while fetching the document data.');
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [fileId]);

    const handleNewMessage = async (e) => {
        e.preventDefault();
        const userInput = e.target.elements.message.value;
        if (!userInput.trim() || !user) return;

        setChatMessages(prev => [...prev, { sender: 'user', text: userInput }]);
        e.target.reset();
        setIsAiTyping(true);

        try {
            const result = await documentService.chatWithDocument(fileId, user.id, userInput);

            if (result.success) {
                setChatMessages(prev => [...prev, { 
                    sender: 'ai', 
                    text: result.data.aiResponse,
                    isTyping: true 
                }]);
            } else {
                setChatMessages(prev => [...prev, { 
                    sender: 'ai', 
                    text: 'Sorry, I encountered an error.',
                    isTyping: true 
                }]);
            }
        } catch (error) {
            setChatMessages(prev => [...prev, { 
                sender: 'ai', 
                text: 'Sorry, I encountered an error.',
                isTyping: true 
            }]);
        } finally {
            setIsAiTyping(false);
        }
    };

    if (loading) {
        return <div className="w-full min-h-[calc(100vh-65px)] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#193A83]"></div></div>;
    }

    if (error) {
        return <div className="w-full min-h-[calc(100vh-65px)] p-6"><div className="max-w-7xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"><strong>Error:</strong> {error}</div></div>;
    }

    return (
        <div className="w-full min-h-[calc(100vh-65px)] p-4 sm:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[#19154E]">Summary</h3>
                            <button className="text-gray-400 hover:text-black"><FiCopy /></button>
                            <button className="text-primary hover:text-primary-dark"><FiCopy /></button>
                        </div>
                        <div className="p-5 text-gray-600 text-sm leading-relaxed max-h-[65vh] overflow-y-auto space-y-4">
                            {summaryData ? (
                                <>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Overall Summary</h4>
                                        <p>{Array.isArray(summaryData.summary) ? summaryData.summary.join(' ') : summaryData.summary}</p>
                                    </div>
                                    {summaryData.obligations && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-2">Your Obligations</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {summaryData.obligations.you && summaryData.obligations.you.map((item, index) => <li key={index}>{item}</li>)}
                                            </ul>
                                            <h4 className="font-semibold text-gray-800 my-2">Other Party's Obligations</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {summaryData.obligations.other_party && summaryData.obligations.other_party.map((item, index) => <li key={index}>{item}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : <p>No summary available.</p>}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                        <div className="p-5 border-b border-gray-200"><h3 className="text-xl font-semibold text-[#19154E]">Chat with Document</h3></div>
                        <div className="p-5 flex-grow overflow-y-auto h-[60vh]">
                            <div className="space-y-4">
                                {chatMessages.map((msg, index) => (
                                    <div key={index}>
                                        {msg.sender === 'ai' && msg.isTyping ? (
                                            <TypingMessage 
                                                message={msg.text} 
                                                onComplete={() => {
                                                    setChatMessages(prev => 
                                                        prev.map((m, i) => 
                                                            i === index ? { ...m, isTyping: false } : m
                                                        )
                                                    );
                                                }}
                                            />
                                        ) : (
                                            <div className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                                <p className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-[#193A83] text-white'}`}>{msg.text}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isAiTyping && (
                                    <div className="flex justify-start">
                                        <div className="max-w-xs lg:max-w-md p-3 rounded-lg bg-gray-100 text-gray-800">
                                            <div className="flex items-center space-x-1">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 border-t border-gray-200">
                            <form onSubmit={handleNewMessage} className="flex items-center gap-2">
                                <input name="message" type="text" placeholder="Ask a question..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193A83] text-gray-900" />
                                <button type="submit" disabled={isAiTyping} className="p-3 bg-[#193A83] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"><FiSend /></button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SummaryPage;