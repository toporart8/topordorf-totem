import Replicate from "replicate";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { prompt, maskImage } = req.body;

    try {
        console.log("Step 1: Expanding prompt with Gemini...");

        // 1. Gemini Flash Prompt Expansion
        const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const aiInstruction = `
            You are a professional tattoo and engraving artist.
            User Input: "${prompt}"
            
            Task: Create a highly detailed visual description for a black and white vector stencil.
            
            Guidelines:
            Guidelines:
            - SUBJECT: Based strictly on the User Input ("${prompt}").
            - COMPOSITION: Create a full scene around the subject (e.g., if "Wolf", add forest/moon; if "Viking", add ship/sea).
            - STYLE: Vintage Outdoor Badge style, Vector Illustration. 
            - DETAILS: Bold lines, clear shapes, high contrast. 
            - NO shading, NO stippling, NO gradients. Pure Black and White.
            - TEXT: ABSOLUTELY NO TEXT, NO LETTERS, NO TYPOGRAPHY.
            
            Output ONLY the English prompt description.
        `;

        let smartPrompt = prompt;
        try {
            const geminiResult = await textModel.generateContent(aiInstruction);
            smartPrompt = geminiResult.response.text().trim();
            console.log("Gemini Generated Prompt:", smartPrompt);
        } catch (genError) {
            console.error("Gemini Error (using raw prompt):", genError);
        }

        console.log("Step 2: Generating image with FLUX-Fill...");

        // Reverting to FLUX-Fill for strict mask adherence
        // Now using the improved "Vintage Badge" prompt strategy
        const output = await replicate.run(
            "black-forest-labs/flux-fill-dev",
            {
                input: {
                    prompt: `${smartPrompt}. 
                             Style: Vintage monochrome vector badge, outdoor adventure sticker style.
                             Visuals: Bold black lines, white negative space, solid shapes, woodcut aesthetic.
                             Forbidden tags: text, letters, typography, watermark, shading, gray, noise, realism, color.`,
                    image: maskImage,
                    mask: maskImage,
                    guidance: 12,      // High guidance for style adherence
                    output_format: "png",
                    steps: 50
                }
            }
        );

        // Robustly extract URL from Replicate output
        let imageUrl = output;

        // 1. If it's an array, take the first item
        if (Array.isArray(imageUrl)) {
            imageUrl = imageUrl[0];
        }

        // 2. If it's an object (Replicate File), try to get the URL
        if (imageUrl && typeof imageUrl === 'object') {
            if (typeof imageUrl.url === 'function') {
                // Replicate SDK File object
                imageUrl = imageUrl.url();
            } else if (imageUrl.url) {
                // Plain object with url property
                imageUrl = imageUrl.url;
            } else if (imageUrl.toString && imageUrl.toString() !== '[object Object]') {
                // Try toString if it gives something useful
                imageUrl = imageUrl.toString();
            }
        }

        console.log("Extracted Image URL:", imageUrl);
        res.status(200).json({ image: imageUrl });

    } catch (e) {
        console.error("API Error:", e);
        res.status(500).json({ error: e.message || "Ошибка генерации" });
    }
}
