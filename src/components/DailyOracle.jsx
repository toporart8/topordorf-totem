import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dailySigns } from '../utils/predictions';

const DailyOracle = ({ isOpen, onClose, telegramLink }) => {
    const [hasPredictedToday, setHasPredictedToday] = useState(false);
    const [selectedSign, setSelectedSign] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledCards, setShuffledCards] = useState([]);

    useEffect(() => {
        if (isOpen) {
            checkPredictionStatus();
        }
    }, [isOpen]);

    const checkPredictionStatus = () => {
        const lastDate = localStorage.getItem('topordorf_last_prediction_date');
        const today = new Date().toDateString();

        if (lastDate === today) {
            const savedSignId = localStorage.getItem('topordorf_prediction_id');
            const sign = dailySigns.find(s => s.id === parseInt(savedSignId));
            if (sign) {
                setHasPredictedToday(true);
                setSelectedSign(sign);
                setIsFlipped(true); // Show result immediately
            } else {
                // Fallback if ID invalid, reset
                resetForNewDay();
            }
        } else {
            resetForNewDay();
        }
    };

    const resetForNewDay = () => {
        setHasPredictedToday(false);
        setSelectedSign(null);
        setIsFlipped(false);
        // Shuffle and pick 4 random cards visually
        // We actually only need one result, but we show 4 options.
        // Let's decide the result *when* the user clicks, or pre-determine it?
        // User requirement: "User chooses -> save date and ID -> Show result"
        // So we can just wait for the click. The cards are identical "backs".
        setShuffledCards([1, 2, 3, 4]);
    };

    const handleCardClick = (cardIndex) => {
        if (hasPredictedToday) return;

        // Pick a random prediction
        const randomIndex = Math.floor(Math.random() * dailySigns.length);
        const result = dailySigns[randomIndex];

        // Save to localStorage
        const today = new Date().toDateString();
        localStorage.setItem('topordorf_last_prediction_date', today);
        localStorage.setItem('topordorf_prediction_id', result.id);

        setSelectedSign(result);
        setHasPredictedToday(true);
        setIsFlipped(true);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl w-full max-w-lg shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Logo */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0">
                            <img src="/images/oracle_bg.png" alt="" className="w-3/4 object-contain" />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-2xl text-white font-serif uppercase tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] text-center">
                            Твой совет на сегодня
                        </h2>
                        <p className="text-base text-white font-medium drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse mb-6 text-center">
                            {hasPredictedToday ? "Знак на сегодня уже получен. Возвращайся завтра!" : "Выбери карту, чтобы узнать судьбу."}
                        </p>

                        {!hasPredictedToday ? (
                            // CARD SELECTION VIEW
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {shuffledCards.map((card, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.05, borderColor: '#f97316' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCardClick(index)}
                                        className="aspect-[2/3] bg-zinc-800 border-2 border-zinc-600 rounded-lg cursor-pointer flex items-center justify-center relative overflow-hidden group"
                                    >
                                        {/* Card Back Image */}
                                        <div className="absolute inset-0">
                                            <img
                                                src="/images/card_back.JPG"
                                                alt="Card Back"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            // RESULT VIEW
                            <div className="flex flex-col items-center text-center space-y-6">
                                <motion.div
                                    initial={{ rotateY: 90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, type: "spring" }}
                                    className="w-48 h-72 bg-zinc-800 border-2 border-orange-500 rounded-lg flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                                >
                                    {/* Placeholder for Rune/Sign Image - using a gradient if image fails or generic logic */}
                                    {selectedSign?.image ? (
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                            {/* In a real app, use <img>. Here using text for placeholder if image missing, or img if Present */}
                                            <span className="text-5xl">🔮</span>
                                            {/* <img src={selectedSign.image} alt={selectedSign.title} className="w-full h-full object-cover" /> */}
                                        </div>
                                    ) : (
                                        <span className="text-6xl">✨</span>
                                    )}

                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2">
                                        <p className="text-orange-500 font-bold uppercase text-sm tracking-wider">{selectedSign?.title}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h3 className="text-xl text-white font-serif mb-2">{selectedSign?.title}</h3>
                                    <p className="text-zinc-300 italic text-sm mb-6 max-w-sm mx-auto">
                                        "{selectedSign?.text}"
                                    </p>

                                    <a
                                        href={telegramLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center px-6 py-3 bg-[#229ED9] hover:bg-[#1E8BBF] text-white font-bold uppercase rounded-full transition-all shadow-lg hover:shadow-blue-500/30 gap-3 animate-pulse"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.02-2.38-1.63-1.05-.69-.37-1.07.23-1.68.15-.15 2.81-2.57 2.86-2.79.01-.05.01-.1-.02-.14-.03-.04-.08-.06-.11-.04-.08.02-1.29.82-3.64 2.41-.34.23-.66.35-.97.35-.32-.01-.94-.18-1.4-.33-.56-.18-1.01-.28-1.04-.58.02-.16.24-.32.65-.49 2.54-1.1 4.23-1.84 5.08-2.19 2.42-.99 2.92-1.16 3.25-1.16.07 0 .23.01.33.09.09.07.12.17.12.27 0 .1 0 .2-.01.24z" />
                                        </svg>
                                        <div className="flex flex-col items-center leading-none text-center">
                                            <span className="text-sm">Получить больше полезной информации</span>
                                            <span className="text-sm mt-1">Бесплатно</span>
                                        </div>
                                    </a>
                                </motion.div>
                            </div>
                        )}



                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DailyOracle;
