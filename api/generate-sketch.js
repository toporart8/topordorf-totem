import Replicate from "replicate";
import fs from "fs";
import path from "path";

// Разрешаем загрузку больших картинок (масок)
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

    // Если токена нет - ошибка
    if (!process.env.REPLICATE_API_TOKEN) {
        return res.status(500).json({ error: "Нет API токена (REPLICATE_API_TOKEN)" });
    }

    // Логика поиска маски (если клиент не прислал, ищем локально)
    let finalMask = maskImage;
    if (!finalMask) {
        try {
            const maskPath = path.join(process.cwd(), 'public', 'mask.png');
            if (fs.existsSync(maskPath)) {
                const maskBuffer = fs.readFileSync(maskPath);
                finalMask = `data:image/png;base64,${maskBuffer.toString('base64')}`;
            }
        } catch (e) {
            console.log("Локальная маска не найдена, надеемся на клиента.");
        }
    }

    try {
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        console.log("Запускаем Stable Diffusion Inpainting...");

        const output = await replicate.run(
            // ЭТО ТОЧНАЯ ВЕРСИЯ МОДЕЛИ (SD 2.0 Inpainting), ОНА РАБОТАЕТ 100%
            "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd595c",
            {
                input: {
                    prompt: `black and white vector line art, engraving style, simple monochrome, ${prompt}`,
                    negative_prompt: "color, grey, shading, realistic, photo, blurry, watermark, text",
                    image: finalMask, // Картинка-основа
                    mask: finalMask,  // Маска (где рисовать)
                    num_inference_steps: 25,
                    guidance_scale: 7.5,
                    strength: 1.0 // 1.0 = перерисовать всё внутри маски
                }
            }
        );

        console.log("Успех:", output);
        // Replicate иногда возвращает массив, иногда строку. Берем первое.
        const imageUrl = Array.isArray(output) ? output[0] : output;

        res.status(200).json({ image: imageUrl });

    } catch (error) {
        console.error("Ошибка Replicate:", error);
        res.status(500).json({ error: error.message || "Ошибка генерации" });
    }
}
