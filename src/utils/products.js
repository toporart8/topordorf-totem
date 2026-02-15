export const products = [
    {
        id: 1,
        name: "Оберег Велес'",
        description: "Этот оберег — не просто украшение, а мощная духовная броня, связывающая владельца с энергией предков. Знак Велеса издревле считается одним из самых сильных артефактов для защиты и обретения благополучия, особенно для тех, кто несет ответственность за свою семью и стоит на защите интересов близких.",
        price: "15 000 ₽",
        image: "/images/obgveles.jpeg",
        tags: ["волк", "ворон", "велес", "куница"],
        categorySlug: "amulets",
        links: {
            wb: "https://www.wildberries.ru/catalog/0",
            ozon: "https://www.ozon.ru/product/talisman-veles-3403078284/?at=Y7tjlXJANIMJGE9Eup0XZKmhP2xENPcOWW2BxUVVoO9o"
        }
    },
    {
        id: 2,
        name: "Топор 'Медвежий'",
        description: "Массивный и надежный. Для тех, кто рожден под знаком Сварога или Лося.",
        price: "16 000 ₽",
        image: "/images/obgveles.jpeg",
        tags: ["медведь", "сварог", "ворон", "лось"],
        categorySlug: "axes",
        links: {
            wb: "https://www.wildberries.ru/catalog/0",
            ozon: "https://www.ozon.ru/product/0"
        }
    },
    {
        id: 3,
        name: "Фигурка 'Сокол'",
        description: "Изящная статуэтка. Символ ясности и победы. Подходит Финисту и Орлу.",
        price: "3 000 ₽",
        image: "/images/obgveles.jpeg",
        tags: ["финист", "сокол", "орел"],
        categorySlug: "figures",
        links: {
            wb: "#",
            ozon: "#"
        }
    },
    {
        id: 4,
        name: "Идол 'Макошь'",
        description: "Оберег для дома. Покровительница судьбы и рукоделия.",
        price: "4 000 ₽",
        image: "/images/obgveles.jpeg",
        tags: ["лебедь", "щука", "дева", "ворон", "макошь"],
        categorySlug: "figures",
        links: {
            wb: "#",
            ozon: "#"
        }
    },
    {
        id: 5,
        name: "Амулет 'Сварожий Круг'",
        description: "Универсальный оберег из бронзы. Защищает и дает силы всем чертогам.",
        price: "1 200 ₽",
        image: "/images/obgveles.jpeg",
        tags: ["общий"],
        categorySlug: "amulets",
        links: {
            wb: "#", // Пример: только WB
            ozon: null
        }
    },
    {
        id: 6,
        name: "Топор 'Мудрость Ворона'",
        description: "Кованая сталь, рукоять из ясеня. Идеален для рожденных в Чертог Ворона.",
        price: "18 500 ₽",
        image: "/images/obgveles.jpeg",
        tags: ["ворон", "коляда", "мудрость"],
        categorySlug: "axes",
        links: {
            wb: "https://www.wildberries.ru",
            ozon: "https://www.ozon.ru"
        }
    }
];

export const categories = [
    { id: 1, name: "Топоры", slug: "axes", image: "/images/cat_axes.jpg" },
    { id: 2, name: "Фигурки", slug: "figures", image: "/images/cat_figures.jpg" },
    { id: 3, name: "Амулеты", slug: "amulets", image: "/images/cat_amulets.jpg" }
];
