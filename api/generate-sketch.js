import Replicate from "replicate";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // ЭТАП 1: ЗАПУСК ГЕНЕРАЦИИ (POST)
    if (req.method === "POST") {
        const { prompt, maskImage } = req.body;
        try {
            // Стиль ТопорДорф: ЧБ, линии средней толщины под плоттерную резку.
            // Знак Зодиака располагать в верхней части топорища, Чертог — в нижней.
            const systemPrompt = "Strict black and white vector line art for plotter cutting, medium line thickness, no grey, no shading, white background. Top part: Zodiac sign. Bottom part: Slavic Hall symbol. Center piece: ";

            const prediction = await replicate.predictions.create({
                // Используем проверенный хэш версии (Stable Diffusion Inpainting)
                version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
                input: {
                    // Усиливаем акцент на заполнении всей формы
                    prompt: `High-contrast black and white stencil art, bold lines for vinyl cutting. 
                             TOP PART: large stylized ${prompt} zodiac sign. 
                             BOTTOM PART: traditional Slavic Hall (Chertog) symbol. 
                             The design must fill the entire white area of the mask. 
                             No gray areas, no shading, clean thick black lines on white background.`,
                    negative_prompt: "thin lines, gray, tiny details, photo, complex, realistic, shading, gradient, blurry, outside of borders",
                    image: maskImage,
                    mask: maskImage,
                    num_inference_steps: 35, // Чуть больше шагов для четкости
                    guidance_scale: 9.0,      // Делаем нейросеть более "послушной" промпту
                    strength: 1.0
                },
            });
            // Возвращаем ID задачи мгновенно (укладываемся в 1 сек)
            return res.status(200).json({ id: prediction.id });
        } catch (e) {
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
