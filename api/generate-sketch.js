import Replicate from "replicate";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // ЭТАП 1: ЗАПУСК (POST запрос)
    if (req.method === "POST") {
        const { prompt, maskImage } = req.body;
        try {
            // Стиль ТопорДорф: ЧБ, линии под плоттер
            const stylePrompt = "Strict black and white vector line art for plotter cutting, medium line thickness, no grey, no shading, white background. Top part: Zodiac sign. Bottom part: Slavic Hall symbol. Center: ";

            const prediction = await replicate.predictions.create({
                // Используем проверенный хэш версии (Stable Diffusion Inpainting)
                version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
                input: {
                    prompt: stylePrompt + prompt,
                    negative_prompt: "color, photo, shading, realistic, gradient, blurry, grey lines",
                    image: maskImage,
                    mask: maskImage,
                    num_inference_steps: 25,
                    strength: 1.0
                },
            });
            return res.status(200).json({ id: prediction.id });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: e.message });
        }
    }

    // ЭТАП 2: ПРОВЕРКА СТАТУСА (GET запрос)
    if (req.method === "GET") {
        const { id } = req.query;
        try {
            const prediction = await replicate.predictions.get(id);
            return res.status(200).json(prediction);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: e.message });
        }
    }
}
