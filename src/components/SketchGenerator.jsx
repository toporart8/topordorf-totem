
import React, { useState } from 'react';

const SketchGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Создаем шедевр...");
    const [resultImage, setResultImage] = useState(null);
    const [error, setError] = useState(null);

    const generateSketch = async () => {
        if (!prompt) {
            alert('Опишите идею эскиза!');
            return;
        }

        setLoading(true);
        setLoadingMessage("Gemini придумывает промпт...");
        setError(null);
        setResultImage(null);

        try {
            // 1. Готовим маску (Client-side fetch)
            const maskResponse = await fetch('/mask.png');
            if (!maskResponse.ok) throw new Error("Не удалось загрузить маску (mask.png)");

            const maskBlob = await maskResponse.blob();
            const reader = new FileReader();
            const maskBase64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(maskBlob);
            });

            // 2. Запрос к серверу (ЭТАП 1: ЗАПУСК)
            const startRes = await fetch('/api/generate-sketch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, maskImage: maskBase64 }),
            });

            const startData = await startRes.json();
            console.log("Start response:", startData);

            if (startData.error) throw new Error(startData.error);

            const predictionId = startData.id;
            if (!predictionId) throw new Error("Сервер не вернул ID задачи");

            // 3. Цикл ожидания (Polling)
            let status = "starting";
            let finalImageUrl = "";

            while (status !== "succeeded" && status !== "failed" && status !== "canceled") {
                await new Promise(r => setTimeout(r, 2500)); // Ждем 2.5 секунды
                setLoadingMessage("Replicate рисует по промпту Gemini... (15-20 сек)");

                const checkRes = await fetch(`/api/generate-sketch?id=${predictionId}`);
                const checkData = await checkRes.json();
                console.log("Poll status:", checkData.status);

                status = checkData.status;

                if (status === "succeeded") {
                    // Replicate returns output as array or string
                    if (Array.isArray(checkData.output)) {
                        finalImageUrl = checkData.output[0];
                    } else {
                        finalImageUrl = checkData.output;
                    }
                } else if (status === "failed") {
                    throw new Error("Нейросеть не смогла завершить рисунок");
                } else if (status === "canceled") {
                    throw new Error("Генерация была отменена");
                }
            }

            if (finalImageUrl) {
                console.log("Устанавливаем URL картинки:", finalImageUrl);
                setResultImage(finalImageUrl);
            } else {
                throw new Error("Не удалось получить ссылку на изображение после завершения");
            }

        } catch (err) {
            console.error("Ошибка во время генерации:", err);
            setError(err.message || "Ошибка генерации");
        } finally {
            setLoading(false);
        }
    };

    const orderSketch = () => {
        const emailTo = "ВАША_ПОЧТА@gmail.com"; // User placeholder
        const subject = encodeURIComponent("Заказ топора с индивидуальным эскизом");
        const body = encodeURIComponent(`Привет! Хочу заказать топор.\n\nМоя идея была: ${prompt}\n\n(ВАЖНО: Прикрепите к этому письму скачанный эскиз, который сгенерировала нейросеть)`);

        window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
    };

    return (
        <section className="sketch-generator-section mt-12 border-t-2 border-zinc-800 pt-8 pb-12 w-full max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-serif text-white text-center mb-4">Мастерская Эскизов</h2>
            <p className="text-zinc-400 text-center max-w-xl mx-auto mb-6">Опиши идею, и нейросеть создаст черно-белый эскиз для гравировки, вписанный в форму топора.</p>

            <div className="input-group max-w-xl mx-auto">
                <textarea
                    id="sketch-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Например: Рыбак Игорь ловит гигантскую щуку, вокруг камыши, стиль минимализм..."
                    rows="4"
                    className="w-full p-3 mb-4 bg-black border-2 border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none transition-colors"
                ></textarea>
                <button
                    onClick={generateSketch}
                    disabled={loading}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

            {resultImage && (
                <div id="sketch-result" className="mt-8 text-center animate-fade-in">
                    <h3 className="text-xl text-white font-serif mb-4">Твой эскиз:</h3>
                    <div className="axe-preview-container relative inline-block max-w-full w-[500px] border border-zinc-800 rounded-lg overflow-hidden">
                        <img
                            src={resultImage}
                            alt="Sketch"
                            className="w-full h-auto block"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                alert("Не удалось загрузить картинку: " + resultImage);
                            }}
                        />
                        {/* Mask Overlay for better visibility of boundaries */}
                        <div
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{
                                backgroundImage: 'url(/mask.png)',
                                backgroundSize: 'cover',
                                opacity: 0.5
                            }}
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
