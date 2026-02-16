import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { prompt } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    try {
        // Используем Imagen 3 для генерации
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });

        // Формируем детальный промпт для Gemini
        const fullPrompt = `
      Professional black and white line art sketch for axe engraving. 
      Subject: ${prompt}.
      Style: High contrast, pure black and white, no gray, no shading, no gradients. 
      Technical: Bold clean lines suitable for vinyl plotter cutting. 
      Composition: The design must be vertically oriented and stylized to fit a traditional axe head shape. 
      Background: Solid white.
    `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;

        // Получаем изображение (Gemini возвращает base64)
        const base64Image = response.candidates[0].content.parts[0].inlineData.data;

        res.status(200).json({ image: `data:image/png;base64,${base64Image}` });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Gemini не смог создать эскиз. Проверь баланс/ключ." });
    }
}
