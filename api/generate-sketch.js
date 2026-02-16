import Replicate from "replicate";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { prompt } = req.body;

    try {
        // Используем FLUX.1-schnell — он в 10 раз умнее старых моделей
        const prediction = await replicate.predictions.create({
            version: "a43f34d11974006e8640994d5d36e788755605d3b3780f2d7a224c6999b8004f", // flux-schnell
            input: {
                prompt: `Extreme high-contrast black and white stencil art for axe engraving. 
                         The design MUST include: ${prompt}. 
                         Style: Sharp vector lines, solid black on pure white background, woodcut engraving. 
                         NO shading, NO gray, NO gradients. Professional plotter-ready art.`,
                aspect_ratio: "2:3", // Идеально под форму топорища
                output_format: "png",
                go_fast: true,
                megapixels: "1"
            },
        });

        // Ждем результат (FLUX работает очень быстро - polling на сервере)
        let response = await replicate.predictions.get(prediction.id);
        let attempts = 0;
        while (response.status !== "succeeded" && response.status !== "failed" && response.status !== "canceled" && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            response = await replicate.predictions.get(prediction.id);
            attempts++;
        }

        if (response.status === "succeeded") {
            // FLUX output is typically an array of URLs
            const imageUrl = Array.isArray(response.output) ? response.output[0] : response.output;
            res.status(200).json({ image: imageUrl });
        } else {
            throw new Error(`Ошибка генерации: статус ${response.status}`);
        }

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
