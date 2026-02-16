import Replicate from "replicate";

export default async function handler(req, res) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { prompt } = req.body;

    try {
        console.log("Generating sketch with PrunaAI Flux-Fast...");

        const input = {
            seed: -1,
            prompt: `Extreme high-contrast black and white stencil art for axe engraving. 
                     The design MUST include: ${prompt}. 
                     Style: Sharp vector lines, solid black on pure white background, woodcut engraving. 
                     NO shading, NO gray, NO gradients. Professional plotter-ready art.`,
            guidance: 3.5, // Как в примере пользователя
            image_size: 1024, // Как в примере
            speed_mode: "Extra Juiced 🔥 (more speed)", // Максимальная скорость
            aspect_ratio: "2:3", // Под форму топора (было 1:1 в примере, но для топора лучше вертикальный)
            output_format: "png", // PNG лучше для дальнейшей обработки (в примере jpg, но png чище для линий)
            output_quality: 80,
            num_inference_steps: 28 // Как в примере
        };

        // Используем метод .run() как в примере
        const output = await replicate.run("prunaai/flux-fast", { input });

        // PrunaAI Flux-Fast возвращает объект FileOutput или URL
        // В примере: console.log(output.url());
        // Но Replicate SDK часто возвращает просто URL или массив, если это output модели.
        // Проверим структуру. Обычно run возвращает результат напрямую.

        // Если output - это объект с методом url() (как в примере Replicate SDK v1.0+ File objects), 
        // то нужно получить url. Если это просто строка/массив - берем их.

        let imageUrl;
        if (output && typeof output.url === 'function') {
            imageUrl = output.url();
        } else if (Array.isArray(output)) {
            imageUrl = output[0];
            // Если это File object внутри массива
            if (imageUrl && typeof imageUrl.url === 'function') {
                imageUrl = imageUrl.url();
            }
        } else {
            imageUrl = output;
        }

        console.log("Generation success:", imageUrl);
        res.status(200).json({ image: imageUrl });

    } catch (e) {
        console.error("Replicate Error:", e);
        res.status(500).json({ error: e.message || "Ошибка генерации" });
    }
}
