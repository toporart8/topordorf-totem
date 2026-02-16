import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { prompt, maskImage } = req.body;

    if (!process.env.GOOGLE_API_KEY) {
        return res.status(500).json({ error: "GOOGLE_API_KEY is not set" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    try {
        // Используем Imagen 3 (или 4, если доступна в вашем регионе API)
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });

        // Формируем жесткий промпт на основе правил ТопорДорф
        const fullPrompt = `
      Create a professional black and white line art sketch for axe engraving. 
      STYLE: High contrast, pure black and white, no gray, no shading. Lines of medium thickness suitable for vinyl plotter cutting.
      SHAPE: The design must be strictly contained within the silhouette of an axe head.
      COMPOSITION:
      - TOP SECTION: A clear, stylized Zodiac sign based on: ${prompt}.
      - BOTTOM SECTION: A traditional Slavic Chertog (Hall) symbol.
      - BACKGROUND: Pure white.
      The entire drawing must look like a solid stencil.
    `;

        // Note: Imagen generation via generateContent might requires specific beta access or different method depending on exact API version,
        // but we follow the user's snippet.
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        });

        // Получаем изображение в формате base64
        const response = await result.response;
        // Inspecting structure based on user snippet
        // Assuming the API returns inlineData for image generation requests if configured correctly
        // or if the user is using a specific multimodal capability.

        // Safety check for the structure
        if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts[0].inlineData) {
            throw new Error("Unexpected response structure from Gemini. Image data not found.");
        }

        const generatedImage = response.candidates[0].content.parts[0].inlineData.data;

        res.status(200).json({ image: `data:image/png;base64,${generatedImage}` });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Ошибка генерации Gemini: " + error.message });
    }
}
