import Replicate from "replicate";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // ЭТАП 1: ЗАПУСК (POST)
    if (req.method === "POST") {
        const { prompt, maskImage } = req.body;
        try {
            // 1. Используем более точное имя модели, чтобы не было 404
            // gemini-1.5-flash-latest - это алиас для использования последней версии
            const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

            const aiInstruction = `You are a professional axe engraving designer for "ToporDorf". 
            Expand this request: "${prompt}". 
            Style: Bold black and white vector line art for plotter cutting. 
            No shading, no gray. The design must fit the axe head shape.`;

            const geminiResult = await textModel.generateContent(aiInstruction);
            const smartPrompt = geminiResult.response.text();
            console.log("Gemini Smart Prompt:", smartPrompt);

            // 2. Рисуем через Replicate (используем твои $2)
            const prediction = await replicate.predictions.create({
                // Using the specific proven hash ...fd68b3 to ensure stability
                version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
                input: {
                    prompt: smartPrompt,
                    negative_prompt: "color, photo, shading, realistic, gradient, blurry, grey, thin lines",
                    image: maskImage,
                    mask: maskImage,
                    num_inference_steps: 30,
                    guidance_scale: 12.0,
                    strength: 1.0
                },
            });
            return res.status(200).json({ id: prediction.id });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: e.message });
        }
    }

    // ЭТАП 2: ПРОВЕРКА ГОТОВНОСТИ (GET)
    if (req.method === "GET") {
        const { id } = req.query;
        try {
            const prediction = await replicate.predictions.get(id);
            return res.status(200).json(prediction);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
}
