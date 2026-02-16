import Replicate from "replicate";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { prompt } = req.body;

    try {
        console.log("Generating sketch with FLUX-Schnell...");

        // Используем метод .run() с именем модели вместо хэша
        // Это автоматически берет последнюю версию и ждет результат
        const output = await replicate.run(
            "black-forest-labs/flux-schnell",
            {
                input: {
                    prompt: `Extreme high-contrast black and white stencil art for axe engraving. 
                             The design MUST include: ${prompt}. 
                             Style: Sharp vector lines, solid black on pure white background, woodcut engraving. 
                             NO shading, NO gray, NO gradients. Professional plotter-ready art.`,
                    aspect_ratio: "2:3",
                    output_format: "png",
                    go_fast: true,
                    megapixels: "1"
                }
            }
        );

        // output обычно возвращает массив строк (URL картинок) или стрим
        // Для FLUX это массив: ["https://..."]
        const imageUrl = Array.isArray(output) ? output[0] : output;

        console.log("Generation success:", imageUrl);
        res.status(200).json({ image: imageUrl });

    } catch (e) {
        console.error("Replicate Error:", e);
        res.status(500).json({ error: e.message || "Ошибка генерации" });
    }
}
