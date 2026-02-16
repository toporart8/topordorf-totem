import Replicate from "replicate";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // ЭТАП 1: ЗАПУСК (POST)
    if (req.method === "POST") {
        const { prompt, maskImage } = req.body;
        try {
            // Технические требования стиля «ТопорДорф»
            // Добавляем требование заполнения всей белой области маски
            const strictStyle = "High-contrast silhouette stencil, bold black vector lines on pure white background. The design MUST fill the entire white area of the provided mask from edge to edge. Medium line thickness for plotter cutting. No shading, no gray, no gradients. Content: ";

            const prediction = await replicate.predictions.create({
                // Используем проверенный рабочий хэш (из документации), чтобы избежать ошибки 422
                version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
                input: {
                    prompt: strictStyle + prompt,
                    negative_prompt: "thin lines, gray, tiny details, photo, complex, realistic, shading, gradient, blurry, empty spaces inside mask",
                    image: maskImage,
                    mask: maskImage,
                    num_inference_steps: 35, // Больше шагов для четкости линий
                    guidance_scale: 12.0,    // Повышаем точность следования инструкциям
                    strength: 1.0            // Полная перерисовка внутри маски
                },
            });
            return res.status(200).json({ id: prediction.id });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // ЭТАП 2: ПРОВЕРКА (GET)
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
