import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dailySigns } from '../utils/predictions';

const DailyOracle = ({ isOpen, onClose, telegramLink }) => {
    const [hasPredictedToday, setHasPredictedToday] = useState(false);
    const [selectedSign, setSelectedSign] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledCards, setShuffledCards] = useState([]);
    const [isDonationOpen, setIsDonationOpen] = useState(false);

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
                            <div className="flex flex-col items-center text-center space-y-4">
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
                                    className="w-full flex flex-col items-center space-y-4"
                                >
                                    <div>
                                        <h3 className="text-xl text-white font-serif mb-2">{selectedSign?.title}</h3>
                                        <p className="text-zinc-300 italic text-sm mb-2 max-w-sm mx-auto">
                                            "{selectedSign?.text}"
                                        </p>
                                    </div>

                                    <a
                                        href={telegramLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full max-w-xs py-3 bg-[#229ED9] hover:bg-[#1E8BBF] text-white font-bold uppercase rounded-full transition-all shadow-lg hover:shadow-blue-500/30 animate-pulse flex flex-col items-center leading-none"
                                    >
                                        <span className="text-xs sm:text-sm">Получить больше полезной</span>
                                        <span className="text-xs sm:text-sm mt-1">информации бесплатно</span>
                                    </a>

                                    <button
                                        onClick={() => setIsDonationOpen(true)}
                                        className="w-full max-w-xs py-3 bg-transparent border border-amber-600 text-amber-500 hover:bg-amber-600 hover:text-white font-bold uppercase rounded-full transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">🔥</span>
                                        Подкинуть дров
                                    </button>
                                </motion.div>
                            </div>
                        )}



                    </motion.div>
                </motion.div>
            )
            }

            {/* Donation Modal */}
            <AnimatePresence>
                {isDonationOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
                        onClick={() => setIsDonationOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black/80 border border-amber-500/50 p-8 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden text-center"
                        >
                            {/* Fire Background Effect */}
                            <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-t from-orange-900 via-red-900 to-black pointer-events-none"></div>

                            <button
                                onClick={() => setIsDonationOpen(false)}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="relative z-10 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-serif text-amber-500 uppercase tracking-widest mb-2 drop-shadow-md">
                                        Поддержать Огонь
                                    </h2>
                                    <p className="text-zinc-400 text-sm uppercase tracking-wider">
                                        Благодарность Мастеру
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-xl inline-block shadow-2xl">
                                    <img
                                        src="/images/qr_code.png"
                                        alt="QR Code for Donation"
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>

                                <p className="text-amber-100/90 italic text-sm font-medium leading-relaxed max-w-xs mx-auto">
                                    "Твоя поддержка помогает огню греть ярче, а мастеру создавать. Процветания твоему Роду!"
                                </p>

                                <a
                                    href="https://pay.cloudtips.ru/p/22e8f9f6"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-4 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold uppercase rounded-xl transition-all shadow-lg hover:shadow-orange-500/40 relative overflow-hidden group"
                                >
                                    <span className="relative z-10">Поблагодарить</span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence >
    );
};

export default DailyOracle;
