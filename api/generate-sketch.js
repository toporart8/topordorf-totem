import Replicate from "replicate";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // ЭТАП 1: ЗАПУСК (POST)
    if (req.method === "POST") {
        const { prompt, maskImage } = req.body;
        try {
            // 1. Gemini Flash (Бесплатно) проектирует эскиз
            const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const aiInstruction = `You are a professional axe engraving designer. 
            Translate and expand this request: "${prompt}". 
            Style: Bold black and white vector line art for plotter cutting. 
            Requirements: No shading, no gray, high contrast. 
            Composition: Fill the axe head shape entirely.`;

            const geminiResult = await textModel.generateContent(aiInstruction);
            const smartPrompt = geminiResult.response.text();
            console.log("Gemini Smart Prompt:", smartPrompt);

            // 2. Replicate рисует, используя твои $2.00
            const prediction = await replicate.predictions.create({
                // Используем проверенный хэш версии (Stable Diffusion Inpainting) - ...fd68b3
                // Хэш из примера (...595c) заменен на стабильный во избежание ошибок
                version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
                input: {
                    prompt: smartPrompt,
                    negative_prompt: "photo, shading, gradient, blurry, grey, thin lines",
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
