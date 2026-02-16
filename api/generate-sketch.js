import Replicate from "replicate";

export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { prompt, maskImage } = req.body;

    try {
        const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

        // Используем проверенную версию модели
        const output = await replicate.run(
            "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd595c",
            {
                input: {
                    prompt: `black and white line art, engraving style, high contrast, white background, ${prompt}`,
                    negative_prompt: "color, photo, blurry, shading, gradient",
                    image: maskImage,
                    mask: maskImage,
                    num_inference_steps: 25,
                    strength: 1.0
                }
            }
        );

        // Replicate возвращает массив ссылок. Берем первую и чистим её.
        const imageUrl = Array.isArray(output) ? output[0] : output;

        if (!imageUrl) throw new Error("Модель не вернула ссылку");

        res.status(200).json({ url: imageUrl }); // Отправляем как { url: "ссылка" }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
