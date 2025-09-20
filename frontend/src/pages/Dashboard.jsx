import React, { useState, useCallback } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { useDropzone } from 'react-dropzone';

import { useNavigate } from 'react-router-dom';

import { FiUpload, FiUploadCloud, FiFile, FiSend, FiCopy } from 'react-icons/fi';

import { useFileUpload } from '../hooks/useFileUpload';

import { documentService } from '../services/api';

import { useAuth } from '../hooks/useAuth';

import TypingMessage from '../components/TypingMessage';


const FileUploadModal = ({ closeModal, onUploadSuccess }) => {

    const [files, setFiles] = useState([]);

    const { uploading, progress, error, uploadFile } = useFileUpload();


    const onDrop = useCallback(acceptedFiles => {

        setFiles([acceptedFiles[0]]);

    }, []);


    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });


    const handleUpload = async () => {

        if (files.length === 0) return;

        const result = await uploadFile(files[0]);

        if (result.success) {

            if (onUploadSuccess) {

                onUploadSuccess(result.data);

            }

            closeModal();

        }

    };


    return (

        <motion.div

            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"

            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}

            onClick={closeModal}

        >

            <motion.div

                className="bg-white rounded-2xl shadow-xl w-full max-w-lg"

                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}

                onClick={e => e.stopPropagation()}

            >

                {uploading ? (

                    <div className="text-center p-12">

                        <h3 className="text-xl font-semibold text-[#19154E] mb-4">Analyzing Document...</h3>

                        <div className="w-full bg-gray-200 rounded-full h-2.5"><motion.div className="bg-[#193A83] h-2.5 rounded-full" animate={{ width: `${progress}%` }}/></div>

                        <p className="mt-3 text-lg font-medium text-[#19154E]">{progress}%</p>

                    </div>

                ) : (

                    <>

                        <div className="p-6 border-b border-gray-200"><h3 className="text-xl font-bold text-[#19154E]">Upload File</h3></div>

                        <div className="p-6">

                            {error && (

                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">

                                    {error}

                                </div>

                            )}

                            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer ${isDragActive ? 'border-[#193A83] bg-gray-50' : 'border-gray-300'}`}>

                                <input {...getInputProps()} />

                                <FiUploadCloud className="mx-auto text-4xl text-gray-400 mb-2" />

                                <p className="font-semibold text-gray-700">Drag & drop or click to upload</p>

                                <p className="text-sm text-gray-500 mt-1">PDF only</p>

                            </div>

                            {files.length > 0 && <div className="mt-4 text-sm text-black flex items-center gap-2"><FiFile /> {files[0].name}</div>}

                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end">

                            <motion.button

                                onClick={handleUpload}

                                disabled={files.length === 0 || uploading}

                                className="bg-black text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"

                                whileHover={{ scale: files.length > 0 && !uploading ? 1.05 : 1 }}

                                whileTap={{ scale: files.length > 0 && !uploading ? 0.95 : 1 }}

                            >

                                {uploading ? 'Uploading...' : 'Upload & Analyze'}

                            </motion.button>

                        </div>

                    </>

                )}

            </motion.div>

        </motion.div>

    );

};


const Dashboard = () => {

    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activeFile, setActiveFile] = useState(null);

    const [chatMessages, setChatMessages] = useState([]);

    const [isAiTyping, setIsAiTyping] = useState(false);


    const handleUploadSuccess = (fileData) => {

        setActiveFile(fileData);

        setChatMessages([{ sender: 'ai', text: `I have analyzed "${fileData.name}". Ask me anything.` }]);

    };


    const handleNewMessage = async (e) => {

        e.preventDefault();

        const userInput = e.target.elements.message.value;

        if (!userInput.trim() || !activeFile?.id || !user?.id) return;


        setChatMessages(prev => [...prev, { sender: 'user', text: userInput }]);

        e.target.reset();

        setIsAiTyping(true);


        try {

            const result = await documentService.chatWithDocument(activeFile.id, user.id, userInput);


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


    return (

        <>

            <div className="w-full min-h-[calc(100vh-65px)] p-4 sm:p-6 bg-gray-50">

                <div className="max-w-7xl mx-auto">

                    <div className="flex justify-between items-center mb-8">

                        <h2 className="text-3xl font-bold text-[#19154E]">Dashboard</h2>

                        <motion.button

                            onClick={() => setIsModalOpen(true)}

                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md font-semibold bg-black text-white hover:bg-primary-dark focus:ring-2 focus:ring-primary"

                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}

                        >

                            <FiUpload /> Upload File

                        </motion.button>

                    </div>


                    <AnimatePresence mode="wait">

                        <motion.div

                            key={activeFile ? 'analysis' : 'getting-started'}

                            initial={{ opacity: 0, y: 20 }}

                            animate={{ opacity: 1, y: 0 }}

                            exit={{ opacity: 0, y: -20 }}

                            transition={{ duration: 0.4 }}

                        >

                            {activeFile ? (

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

                                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">

                                            <h3 className="text-xl font-semibold text-[#19154E]">Summary of {activeFile.name}</h3>

                                            <button className="text-gray-400 hover:text-black"><FiCopy /></button>

                                        </div>

                                        <div className="p-5 text-gray-600 text-sm leading-relaxed max-h-[60vh] overflow-y-auto">

                                            <p>{Array.isArray(activeFile.summary.summary) ? activeFile.summary.summary.join(' ') : activeFile.summary.summary}</p>

                                        </div>

                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">

                                        <div className="p-5 border-b border-gray-200"><h3 className="text-xl font-semibold text-[#19154E]">Chat with Document</h3></div>

                                        <div className="p-5 flex-grow overflow-y-auto h-[55vh]">

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

                                                <button type="submit" disabled={isAiTyping} className="p-3 bg-primary text-white rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"><FiSend /></button>

                                            </form>

                                        </div>

                                    </div>

                                </div>

                            ) : (

                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">

                                    <h3 className="text-xl font-semibold text-[#19154E]">Upload a file to start analyzing</h3>

                                    <p className="text-gray-500 mt-2 mb-6">You don't have an active document. Upload a PDF to begin.</p>

                                </div>

                            )}

                        </motion.div>

                    </AnimatePresence>

                </div>

            </div>

            <AnimatePresence>

                {isModalOpen && <FileUploadModal closeModal={() => setIsModalOpen(false)} onUploadSuccess={handleUploadSuccess} />}

            </AnimatePresence>

        </>

    );

};


export default Dashboard; 