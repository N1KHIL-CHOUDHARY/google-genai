import React, { useState, useEffect } from 'react';

const TypingMessage = ({ message, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        if (currentIndex < message.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + message[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 25); // Slightly faster for snappier feel
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, message, onComplete]);

    useEffect(() => {
        setDisplayedText('');
        setCurrentIndex(0);
    }, [message]);

    // Blinking cursor effect
    useEffect(() => {
        if (currentIndex < message.length) {
            const cursorInterval = setInterval(() => {
                setShowCursor(prev => !prev);
            }, 400);
            return () => clearInterval(cursorInterval);
        } else {
            setShowCursor(false);
        }
    }, [currentIndex, message.length]);

    return (
        <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md p-3 rounded-lg bg-gray-100 text-gray-800">
                <p>{displayedText}
                    {currentIndex < message.length && showCursor && (
                        <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1 align-middle">|</span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default TypingMessage;
