
import React, { useState } from 'react';

const SketchGenerator = ({ usageLimit }) => {
    // State for structured inputs
    const [theme, setTheme] = useState('');
    const [details, setDetails] = useState('');
    const [avoid, setAvoid] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Создаем шедевр...");
    const [resultImage, setResultImage] = useState(null);
    const [error, setError] = useState(null);
    const [limitReached, setLimitReached] = useState(false);

    const checkLimit = () => {
        if (usageLimit === null) return true; // Unlimited

        const today = new Date().toISOString().split('T')[0];
        const storageKey = `sketch_limit_${today}`;
        const currentUsage = parseInt(localStorage.getItem(storageKey) || '0');

        if (currentUsage >= usageLimit) {
            setLimitReached(true);
            return false;
        }
        return true;
    };

    const incrementUsage = () => {
        if (usageLimit === null) return;

        const today = new Date().toISOString().split('T')[0];
        const storageKey = `sketch_limit_${today}`;
        const currentUsage = parseInt(localStorage.getItem(storageKey) || '0');
        localStorage.setItem(storageKey, (currentUsage + 1).toString());
    };

    const generateSketch = async () => {
        if (!checkLimit()) return;

        if (!theme) {
            alert('Пожалуйста, укажите хотя бы тему эскиза!');
            return;
        }

        setLoading(true);
        setLoadingMessage("Колдуем над эскизом...");
        setError(null);
        setResultImage(null);

        // Combine inputs for the prompt
        const fullPrompt = `Theme: ${theme}. Details: ${details}`;

        try {
            // 1. Готовим маску (Client-side fetch) - обязательно для Inpainting
            const maskResponse = await fetch('/mask.png');
            if (!maskResponse.ok) throw new Error("Не удалось загрузить маску (mask.png)");

            const maskBlob = await maskResponse.blob();
            const reader = new FileReader();
            const maskBase64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(maskBlob);
            });

            // 2. Отправляем запрос с маской и доп. полями
            const response = await fetch('/api/generate-sketch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    avoid: avoid, // Send negative prompt separately
                    maskImage: maskBase64
                }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            if (data.image) {
                setResultImage(data.image);
                incrementUsage();
            } else {
                throw new Error("Не удалось получить изображение");
            }

        } catch (err) {
            console.error("Ошибка во время генерации:", err);
            setError(err.message || "Ошибка генерации");
        } finally {
            setLoading(false);
        }
    };

    const orderSketch = () => {
        const emailTo = "ВАША_ПОЧТА@gmail.com";
        const subject = encodeURIComponent("Заказ топора с индивидуальным эскизом");
        const body = encodeURIComponent(`Привет! Хочу заказать топор.\n\nТема: ${theme}\nДетали: ${details}\n\n(ВАЖНО: Прикрепите к этому письму скачанный эскиз)`);

        window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
    };

    return (
        <section className="sketch-generator-section w-full bg-black min-h-[500px] border border-zinc-800 p-8 text-center rounded-2xl relative">
            <h2 className="text-3xl font-serif text-white mb-2">Мастерская Эскизов</h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8">Заполни поля ниже, чтобы мы создали идеальный эскиз для тебя.</p>

            <div className="input-group max-w-xl mx-auto space-y-4 text-left">

                {/* 1. THEME */}
                <div>
                    <label className="block text-amber-500 text-xs font-bold uppercase tracking-widest mb-2">
                        1. Тема (Кто или что?)
                    </label>
                    <input
                        type="text"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="Например: Медведь в лесу, Знак Велеса, Драккар викингов"
                        className="w-full p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none transition-colors placeholder:text-zinc-600"
                    />
                </div>

                {/* 2. DETAILS */}
                <div>
                    <label className="block text-amber-500 text-xs font-bold uppercase tracking-widest mb-2">
                        2. Детали (Что добавить?)
                    </label>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Например: кельтские узоры, руны, дубовые листья, агрессивный стиль..."
                        rows="2"
                        className="w-full p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none transition-colors placeholder:text-zinc-600"
                    ></textarea>
                </div>

                {/* 3. AVOID */}
                <div>
                    <label className="block text-red-500/80 text-xs font-bold uppercase tracking-widest mb-2">
                        3. Чего избегать? (Чего НЕ должно быть)
                    </label>
                    <input
                        type="text"
                        value={avoid}
                        onChange={(e) => setAvoid(e.target.value)}
                        placeholder="Например: черепа, цветы, слишком тонкие линии..."
                        className="w-full p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white focus:border-red-500/50 outline-none transition-colors placeholder:text-zinc-600"
                    />
                </div>

                <button
                    onClick={generateSketch}
                    disabled={loading}
                    className="w-full py-4 mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]"
                >
                    {loading ? loadingMessage : "Создать эскиз"}
                </button>
            </div>

            {loading && (
                <div id="sketch-loader" className="text-center mt-6 text-orange-500 animate-pulse">{loadingMessage}</div>
            )}

            {error && (
                <div className="text-center mt-6 text-red-500">Ошибка: {error}</div>
            )}

            {limitReached && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-red-500/50 p-8 rounded-xl max-w-md text-center shadow-2xl">
                        <h3 className="text-xl font-bold text-red-500 uppercase tracking-widest mb-4">
                            Лимит исчерпан
                        </h3>
                        <p className="text-zinc-300 mb-6">
                            На сегодня ваши попытки генерации закончились (5 из 5).
                            <br />
                            Чтобы продолжить, обратитесь к Мастеру.
                        </p>
                        <a
                            href="https://t.me/Oleg_topordorf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#229ED9] hover:bg-[#1E8BBF] text-white font-bold uppercase rounded-full transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.02-2.38-1.63-1.05-.69-.37-1.07.23-1.68.15-.15 2.81-2.57 2.86-2.79.01-.05.01-.1-.02-.14-.03-.04-.08-.06-.11-.04-.08.02-1.29.82-3.64 2.41-.34.23-.66.35-.97.35-.32-.01-.94-.18-1.4-.33-.56-.18-1.01-.28-1.04-.58.02-.16.24-.32.65-.49 2.54-1.1 4.23-1.84 5.08-2.19 2.42-.99 2.92-1.16 3.25-1.16.07 0 .23.01.33.09.09.07.12.17.12.27 0 .1 0 .2-.01.24z" /></svg>
                            Написать Мастеру
                        </a>
                        <button
                            onClick={() => setLimitReached(false)}
                            className="block w-full mt-4 text-zinc-500 hover:text-white text-xs uppercase tracking-widest"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            {resultImage && (
                <div id="sketch-result" className="mt-8 text-center animate-fade-in">
                    <h3 className="text-xl text-white font-serif mb-4">Твой эскиз:</h3>
                    <div className="axe-preview-container relative inline-block max-w-full w-[500px] border border-zinc-800 rounded-lg overflow-hidden">
                        <img
                            src={resultImage}
                            alt="Sketch"
                            className="w-full h-auto block"
                            style={{
                                maskImage: 'url(/mask.png)',
                                WebkitMaskImage: 'url(/mask.png)',
                                maskMode: 'alpha',
                                WebkitMaskMode: 'alpha',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain'
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                alert("Не удалось загрузить картинку: " + resultImage);
                            }}
                        />
                        {/* Mask Overlay (Optional, for visual debugging/border) */}
                        <div
                            className="absolute top-0 left-0 w-full h-full pointer-events-none border-2 border-zinc-800 rounded-lg"
                        ></div>
                    </div>
                    {/* DEBUG: Show raw URL only if it's short, base64 is too long */}
                    {/* <p className="text-[10px] text-zinc-600 mt-2 break-all font-mono select-all bg-zinc-900 p-2 rounded">{JSON.stringify(resultImage)}</p> */}

                    <div className="mt-6">
                        <button
                            onClick={orderSketch}
                            className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold uppercase rounded-lg transition-all shadow-lg hover:shadow-green-500/20"
                        >
                            Заказать топор с этим эскизом
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default SketchGenerator;
