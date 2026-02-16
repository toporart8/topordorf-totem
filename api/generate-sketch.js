import Replicate from "replicate";
import fs from "fs";
import path from "path";

// Разрешаем загрузку больших данных (для маски)
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt, maskImage } = req.body;

    if (!prompt) return res.status(400).json({ error: "Нужен промт" });

    // 1. Проверяем Токен
    if (!process.env.REPLICATE_API_TOKEN) {
        return res.status(500).json({ error: "Нет API токена. Проверьте .env.local" });
    }

    // 2. Логика поиска маски
    let finalMask = maskImage;
    if (!finalMask) {
        try {
            const maskPath = path.join(process.cwd(), 'public', 'mask.png');
            if (fs.existsSync(maskPath)) {
                const maskBuffer = fs.readFileSync(maskPath);
                finalMask = `data:image/png;base64,${maskBuffer.toString('base64')}`;
            }
        } catch (e) {
            console.log("Маска не найдена локально, используем только то, что прислал клиент.");
        }
    }

    try {
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        console.log("Отправляем запрос в Replicate...");

        // 3. Запуск генерации
        // Используем версию: stability-ai/stable-diffusion-inpainting (официальная)
        const output = await replicate.run(
            "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd595c",
            {
                input: {
                    prompt: `black and white vector line art, engraving style, simple monochrome, high contrast, white background, no shading, ${prompt}`,
                    negative_prompt: "color, grey, shading, realistic, photo, blurry, watermark, text, bad quality, soft lines, gradient",
                    image: finalMask, // На этой картинке рисуем
                    mask: finalMask,  // В этой области рисуем
                    num_inference_steps: 30, // Качество повыше
                    guidance_scale: 7.5,
                    strength: 1.0 // Полная перерисовка
                }
            }
        );

        console.log("Готово:", output);

        // Replicate возвращает массив, берем первую картинку
        const imageUrl = Array.isArray(output) ? output[0] : output;
        res.status(200).json({ image: imageUrl });

    } catch (error) {
        console.error("Ошибка Replicate:", error);
        res.status(500).json({ error: error.message || "Ошибка генерации" });
    }
}
