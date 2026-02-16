import Replicate from "replicate";

export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { prompt, maskImage } = req.body;

    if (!process.env.REPLICATE_API_TOKEN) {
        return res.status(500).json({ error: "API токен не настроен в Vercel" });
    }

    try {
        const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

        // Оптимизируем параметры для скорости (чтобы уложиться в 10 секунд)
        const output = await replicate.run(
            "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd595c",
            {
                input: {
                    prompt: `black and white vector line art, engraving, high contrast, ${prompt}`,
                    negative_prompt: "color, photo, shading, blurry",
                    image: maskImage,
                    mask: maskImage,
                    num_inference_steps: 20, // Уменьшили с 30 до 20 для скорости
                    guidance_scale: 7.0,
                    strength: 1.0
                }
            }
        );

        const imageUrl = Array.isArray(output) ? output[0] : output;

        if (!imageUrl) throw new Error("Модель не вернула ссылку");

        // Возвращаем чистую строку с URL
        res.status(200).json({ imageUrl: imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
