
import Replicate from "replicate";
import fs from "fs";
import path from "path";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
        return res.status(500).json({ error: "REPLICATE_API_TOKEN is not set" });
    }

    try {
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        const maskPath = path.join(process.cwd(), 'public', 'mask.png');

        if (!fs.existsSync(maskPath)) {
            throw new Error("Mask file not found at public/mask.png");
        }

        const maskBuffer = fs.readFileSync(maskPath);
        const maskDataURI = `data:image/png;base64,${maskBuffer.toString('base64')}`;

        const stylePrompt = "black and white vector line art, engraving style, sharp thick lines, stencil, monochrome, no shading, minimal detail, white background, centered composition";
        const finalPrompt = `${stylePrompt}, ${prompt}`;

        console.log("Sending request to Replicate...");

        const output = await replicate.run(
            "diffusers/stable-diffusion-xl-inpainting-1.0",
            {
                input: {
                    prompt: finalPrompt,
                    negative_prompt: "color, gray, shading, gradient, blurry, realistic, photo, 3d, complex background, text, watermark",
                    image: maskDataURI,
                    mask: maskDataURI,
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                    strength: 1.0,
                    scheduler: "K_EULER_ANCESTRAL"
                }
            }
        );

        console.log("Replicate output:", output);

        const imageUrl = Array.isArray(output) ? output[0] : output;

        res.status(200).json({ image: imageUrl });

    } catch (error) {
        console.error("Error generating sketch:", error);
        res.status(500).json({ error: error.message || "Failed to generate sketch" });
    }
}
