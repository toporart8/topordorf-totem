// --- БАЗА ДАННЫХ МАГАЗИНА ---

// 1. Товары (Примеры для каталога)
export const PRODUCTS_DB = [
    { id: 1, name: "Топор 'Ярость Перуна'", category: "axes", price: "12 000 ₽", img: "🪓" },
    { id: 2, name: "Малый походный топор", category: "axes", price: "8 500 ₽", img: "🪓" },
    { id: 3, name: "Идол Велеса (Мрамор)", category: "idols", price: "3 200 ₽", img: "🗿" },
    { id: 4, name: "Статуэтка Лады", category: "idols", price: "3 200 ₽", img: "👩" },
    { id: 5, name: "Рунное панно", category: "amulets", price: "1 500 ₽", img: "ᛉ" },
    { id: 6, name: "Подставка под яйцо 'Пасха'", category: "decor", price: "900 ₽", img: "🥚" },
    { id: 7, name: "Брелок 'Коловрат'", category: "amulets", price: "400 ₽", img: "🔆" },
    { id: 8, name: "Подставка для топора", category: "decor", price: "2 100 ₽", img: "🪵" }
];

// 2. Праздники (Месяц-День)
export const HOLIDAYS_DB = [
    { date: "02-23", name: "День защитника Отечества", type: "male", tags: ["axes", "amulets"] },
    { date: "03-08", name: "Международный женский день", type: "female", tags: ["idols", "decor"] },
    { date: "03-20", name: "Комоедица (Масленица)", type: "general", tags: ["idols", "amulets", "decor"] },
    { date: "05-05", name: "Светлая Пасха", type: "general", tags: ["decor"] }, // Дата меняется, для примера
    { date: "06-21", name: "Купала (Летнее солнцестояние)", type: "general", tags: ["amulets", "idols"] }
];

// --- ЛОГИКА КАЛЕНДАРЯ ---

export function getUpcomingHolidays() {
    const today = new Date();
    const result = [];

    // Проверяем на 30 дней вперед
    for (let i = 0; i <= 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);

        // Формат MM-DD для сравнения
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateString = `${month}-${day}`;

        const holiday = HOLIDAYS_DB.find(h => h.date === dateString);
        if (holiday) {
            // Добавляем дату (для отображения пользователю)
            result.push({ ...holiday, displayDate: `${day}.${month}` });
        }
    }
    return result;
}
