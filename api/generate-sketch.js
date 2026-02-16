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
            - COMPOSITION: Full scene filling the vertical space. 
            - STYLE: Vintage Poster, Bold Sticker Art, Vector Illustration.
            - DETAILS: Thick outlines, clean solid shapes, flat areas. NOT too intricate, NO tiny hatching.
            - MOOD: Folk art, Linocut, Bold Graphic.
            - TEXT: ABSOLUTELY NO TEXT, NO LETTERS.
            
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

        console.log("Step 2: Generating image with Google Nano Banana...");

        // Nano Banana for superior style
        const output = await replicate.run(
            "google/nano-banana",
            {
                input: {
                    prompt: `Transform this image. 
                             Input is a mask. Draw INSIDE the white area.
                             CONTENT: ${smartPrompt}.
                             STYLE: Bold vintage vector sticker, smooth linocut style.
                             visuals: Thick consistent black lines, large white negative spaces, flat vector shapes.
                             COMPOSITION: Balanced poster design, clear readability.
                             FORBIDDEN: TEXT, LETTERS, TYPOGRAPHY, WATERMARK, grey, shading, noise, realism, scratchy lines, tiny details, hatching.
                             IMPORTANT: Draw only the graphic. Do not add any text labels.`,
                    image_input: [maskImage],
                    aspect_ratio: "match_input_image",
                    output_format: "png"
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
