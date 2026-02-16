import Replicate from "replicate";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { prompt, maskImage } = req.body;

    try {
        console.log("Generating sketch with FLUX-Fill...");

        // Используем FLUX-Fill-Dev для точного соблюдения маски
        // Модель требует image и mask. В нашем случае:
        // image - это исходное изображение (мы подаем маску как базу, чтобы он рисовал в ней)
        // mask - это сама маска (белое - где рисовать, черное - где сохранять)
        const output = await replicate.run(
            "black-forest-labs/flux-fill-dev",
            {
                input: {
                    prompt: `Professional black and white vector stencil for axe blade engraving. 
                             Subject: ${prompt}.
                             Style: clean graphics, bold and clear closed contours, optimized for vinyl plotter cutting. 
                             ABSOLUTELY FORBIDDEN: shadows, gradients, gray spots, halftones or thin broken lines. 
                             Only absolutely black color on a pure white background.`,
                    image: maskImage,
                    mask: maskImage,
                    guidance: 7.5,      // Standard guidance for FLUX (was 30, too high)
                    output_format: "png",
                    steps: 50          // Качество > Скорость
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
        console.error("Replicate Error:", e);
        res.status(500).json({ error: e.message || "Ошибка генерации" });
    }
}
