import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DateInput from './components/DateInput';
import DailyOracle from './components/DailyOracle';
import { getSlavicHall, getZoroastrianTotem, getZodiac } from './utils/logic';
import { products, categories } from './utils/products';
import SketchGenerator from './components/SketchGenerator';


const CONTACTS = {
  telegram: "https://t.me/Oleg_topordorf",
  whatsapp: "https://wa.me/qr/KSWHUSHUBL5HJ1",
  max: "https://max.ru/u/f9LHodD0cOLV4pqZZg8Zbt2CkYFRwJfgzbCXhunpRVxVTjbhBp4zHw2YQM0",
  vk: "https://vk.com/твоя_ссылка"
};

const CollapsibleText = ({ text, maxLength = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) return <p className="text-sm text-zinc-400 mt-2">{text}</p>;

  return (
    <div className="mt-2">
      <p className="text-sm text-zinc-400">
        {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-orange-500 text-xs uppercase font-bold mt-1 hover:text-orange-400 transition-colors"
      >
        {isExpanded ? "Свернуть" : "Читать далее"}
      </button>
    </div>
  );
};
function App() {
  const [date, setDate] = useState({ day: '', month: '', year: '' });
  const [result, setResult] = useState(null);
  const [recommendedProduct, setRecommendedProduct] = useState(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isSketchOpen, setIsSketchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Promo Code State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState(false);
  const [promoUseLimit, setPromoUseLimit] = useState(null); // null = unlimited, number = daily limit

  const handlePromoSubmit = async () => {
    const code = promoCode.trim().toLowerCase();

    // Hash the input
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Hashes
    const secretHash = "40d613f5ec9f4b2f5cd565306bb912de486ea9884a11bbdadd076c89c2c63671"; // сисяо
    const limitedHash = "563dcc6b20b1bcb2a3806266aec9729a5fd1f8261f9b1b4e2b8062ee2bb702e6"; // горн

    if (hashHex === secretHash) {
      // Unlimited access
      setPromoUseLimit(null);
      setIsPromoModalOpen(false);
      setIsSketchOpen(true);
      setPromoCode('');
      setPromoError(false);
    } else if (hashHex === limitedHash) {
      // Limited access (5 per day)
      setPromoUseLimit(5);
      setIsPromoModalOpen(false);
      setIsSketchOpen(true);
      setPromoCode('');
      setPromoError(false);
    } else {
      setPromoError(true);
    }
  };

  const findProduct = (slavicData, zoroData) => {
    // Нормализация строк для поиска (нижний регистр)
    const hallName = slavicData.hall.toLowerCase(); // "чертог ворон"
    const godName = slavicData.god.toLowerCase();     // "коляда"
    const totemName = zoroData.totem.toLowerCase();   // "ворон"

    // 1. Поиск по Чертогу (приоритет)
    let match = products.find(p => p.tags.some(tag => hallName.includes(tag) || godName.includes(tag)));

    // 2. Если нет, поиск по Тотему
    if (!match) {
      match = products.find(p => p.tags.some(tag => totemName.includes(tag)));
    }

    // 3. Если нет совпадений - товар по умолчанию (id: 3 - Амулет)
    if (!match) {
      match = products.find(p => p.id === 3);
    }

    return match;
  };

  const handleCalculate = () => {
    const d = parseInt(date.day);
    const m = parseInt(date.month);
    const y = parseInt(date.year);

    if (!d || !m || !y) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }

    const slavic = getSlavicHall(d, m);
    const zoro = getZoroastrianTotem(y, m, d);
    const zodiac = getZodiac(d, m);

    // Подбор товара
    const product = findProduct(slavic, zoro);

    setResult(null);
    setRecommendedProduct(null);

    setTimeout(() => {
      setResult({ slavic, zoro, zodiac });
      setRecommendedProduct(product);
    }, 50);
  };

  return (
    // Главный контейнер (фон)
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-300 flex flex-col items-center justify-center p-4">

      {/* Карточка приложения */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-8 relative">

        {/* Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0">
          <img src="/images/oracle_bg.png" alt="" className="w-3/4 object-contain" />
        </div>

        {/* Заголовок */}
        <div className="bg-black/50 p-6 text-center border-b border-zinc-800 relative z-10">
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest font-serif">
            АРТЕФАКТ
          </h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-3">
            КОД СУДЬБЫ
          </p>
          <button
            onClick={() => setIsOracleOpen(true)}
            className="mt-4 px-4 py-2 border border-orange-500/50 text-orange-500 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-orange-500 hover:text-white transition-all animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.3)]"
          >
            ✦ Твоя Карта Дня ✦
          </button>
        </div>

        {/* Форма (Body) */}
        <div className="p-8 space-y-6">
          <DateInput value={date} onChange={setDate} />

          {/* Кнопка */}
          {/* Кнопка */}
          <button
            onClick={handleCalculate}
            className="w-full py-4 bg-zinc-100 text-black font-bold uppercase tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded cursor-pointer relative overflow-hidden group animate-heartbeat hover:animate-none"
            style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)' }}
          >
            <span className="relative z-10">Узнать свой оберег</span>
            <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </button>

          {/* Блок результатов */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="mt-8 p-6 bg-black/40 border border-zinc-800 rounded text-center space-y-6 relative overflow-hidden"
              >
                {/* Background Logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <img src="/images/oracle_bg.png" alt="" className="w-3/4 object-contain opacity-30 brightness-50" />
                </div>

                {/* Славянский */}
                {/* Славянский */}
                <div className="relative z-10">
                  <h3 className="text-orange-500 text-sm uppercase tracking-wide">Твой Чертог</h3>
                  <p className="text-xl text-white font-medium font-serif mt-1">{result.slavic.hall}</p>
                  <p className="text-xs text-zinc-500 mt-1 mb-2">{result.slavic.god}</p>
                  <CollapsibleText text={result.slavic.description || "Описание чертога пока не добавлено."} />
                </div>

                {/* Зороастрийский (Тотем) */}
                <div className="relative">
                  {/* Background Logo Centered on this section */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] flex items-center justify-center pointer-events-none z-0">
                    <img src="/images/oracle_bg.png" alt="" className="w-full h-full object-contain opacity-30 brightness-50" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-orange-500 text-sm uppercase tracking-wide">Твой Тотем</h3>
                    <p className="text-xl text-white font-medium font-serif mt-1">{result.zoro.totem}</p>
                    <p className="text-xs text-zinc-500 mt-1 mb-2">{result.zoro.symbol}</p>
                    <CollapsibleText text={result.zoro.description || "Описание тотема пока не добавлено."} />
                  </div>
                </div>



                {/* Зодиак */}
                <div className="relative z-10">
                  <h3 className="text-orange-500 text-sm uppercase tracking-wide">Знак Зодиака</h3>
                  <p className="text-xl text-white font-medium font-serif mt-1">{result.zodiac}</p>
                </div>

                {/* Рекомендация Товара */}
                {recommendedProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mt-8 border-t border-zinc-800 pt-6"
                  >
                    <h3 className="text-orange-500 text-sm uppercase tracking-widest font-bold mb-4">
                      Твой Артефакт Силы
                    </h3>

                    <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors">
                      <img
                        src={recommendedProduct.image}
                        alt={recommendedProduct.name}
                        className="w-full aspect-[3/4] object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                      <div className="p-4">
                        <h4 className="text-white font-serif text-lg leading-tight mb-2">
                          {recommendedProduct.name}
                        </h4>
                        <p className="text-xs text-zinc-400 mb-3 line-clamp-3">
                          {recommendedProduct.description}
                        </p>
                        <div className="mt-4">
                          {recommendedProduct.longDescription && (
                            <button
                              onClick={() => setIsLegendOpen(true)}
                              className="text-amber-500 hover:text-amber-400 underline decoration-dotted text-xs sm:text-sm font-medium cursor-pointer mb-4 block text-left transition-colors"
                            >
                              ✦ Узнать значение символа
                            </button>
                          )}
                          <div className="text-zinc-500 text-sm mb-2 text-left">
                            Цена без скидки: {recommendedProduct.price}
                          </div>
                          <div className="text-orange-500 font-bold text-sm mb-3 text-left animate-pulse">
                            Смотреть цену с личной скидкой:
                          </div>
                          <div className="flex gap-3">
                            {recommendedProduct.links?.wb && (
                              <a
                                href={recommendedProduct.links.wb}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-purple-700 text-white text-xs font-bold uppercase py-3 px-2 rounded hover:bg-purple-600 transition-colors text-center flex items-center justify-center"
                              >
                                Wildberries
                              </a>
                            )}
                            {recommendedProduct.links?.ozon && (
                              <a
                                href={recommendedProduct.links.ozon}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-600 text-white text-xs font-bold uppercase py-3 px-2 rounded hover:bg-blue-500 transition-colors text-center flex items-center justify-center"
                              >
                                Ozon
                              </a>
                            )}
                          </div>

                          <a
                            href="https://t.me/topordorf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full mt-3 py-3 bg-[#229ED9] hover:bg-[#1E8BBF] text-white font-bold uppercase rounded transition-all shadow-lg hover:shadow-blue-500/30 flex flex-col items-center justify-center animate-pulse"
                          >
                            <span className="text-xs sm:text-sm leading-none">Получить больше полезной</span>
                            <span className="text-xs sm:text-sm leading-none mt-1">информации бесплатно</span>
                          </a>

                          {/* Кнопка "Вопрос Мастеру" */}
                          <button
                            onClick={() => setIsContactModalOpen(true)}
                            className="w-full mt-3 py-3 border border-zinc-600 text-zinc-300 hover:border-white hover:text-white transition-colors rounded uppercase text-sm tracking-wider font-medium"
                          >
                            Задать вопрос мастеру
                          </button>

                          <button
                            onClick={() => setIsCatalogOpen(true)}
                            className="w-full mt-4 py-3 border border-zinc-700 text-zinc-400 font-bold uppercase tracking-wider text-xs hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                            Весь каталог
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Модальное окно "Связь с Мастером" */}
        <AnimatePresence>
          {isContactModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsContactModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl w-full max-w-sm shadow-2xl space-y-4"
              >
                <h3 className="text-xl font-bold text-white text-center uppercase tracking-wide mb-4">
                  Связь с Мастером
                </h3>

                <a
                  href={CONTACTS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold uppercase rounded text-center transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.02-2.38-1.63-1.05-.69-.37-1.07.23-1.68.15-.15 2.81-2.57 2.86-2.79.01-.05.01-.1-.02-.14-.03-.04-.08-.06-.11-.04-.08.02-1.29.82-3.64 2.41-.34.23-.66.35-.97.35-.32-.01-.94-.18-1.4-.33-.56-.18-1.01-.28-1.04-.58.02-.16.24-.32.65-.49 2.54-1.1 4.23-1.84 5.08-2.19 2.42-.99 2.92-1.16 3.25-1.16.07 0 .23.01.33.09.09.07.12.17.12.27 0 .1 0 .2-.01.24z" />
                  </svg>
                  Telegram
                </a>

                <a
                  href={CONTACTS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold uppercase rounded text-center transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>

                <a
                  href={CONTACTS.max}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold uppercase rounded text-center transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" />
                  </svg>
                  MAX
                </a>

                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="w-full pt-4 text-zinc-500 text-xs uppercase tracking-widest hover:text-white transition-colors"
                >
                  Отмена
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Модальное окно Каталога */}
        <AnimatePresence>
          {isCatalogOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
            >
              <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mt-8 mb-8 shadow-2xl relative">

                {/* Header Каталога */}
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur z-10 border-b border-zinc-800 p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest font-serif">
                    Мастерская
                  </h2>
                  <button
                    onClick={() => { setIsCatalogOpen(false); setActiveCategory(null); }}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-500 hover:text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {!activeCategory ? (
                    // Список Категорий
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map(cat => (
                        <div
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.slug)}
                          className="group relative h-48 rounded-lg overflow-hidden cursor-pointer border border-zinc-800 hover:border-orange-500 transition-colors"
                        >
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-widest font-serif drop-shadow-lg">
                              {cat.name}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Список Товаров
                    <div>
                      <button
                        onClick={() => setActiveCategory(null)}
                        className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-wide font-bold"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Назад к категориям
                      </button>

                      <div className="space-y-6">
                        {products
                          .filter(p => p.categorySlug === activeCategory)
                          .map(product => (
                            <div key={product.id} className="bg-black/40 border border-zinc-800 rounded-lg overflow-hidden flex flex-col sm:flex-row">
                              <div className="sm:w-1/3 aspect-square sm:aspect-auto sm:h-auto relative">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-4 sm:w-2/3 flex flex-col justify-between">
                                <div>
                                  <h4 className="text-white font-serif text-lg leading-tight mb-2">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                                    {product.description}
                                  </p>
                                </div>
                                <div className="mt-2">
                                  <div className="text-zinc-500 text-xs mb-1">
                                    Цена без скидки: {product.price}
                                  </div>
                                  <div className="text-orange-500 font-bold text-sm mb-3">
                                    Смотреть цену с личной скидкой:
                                  </div>
                                  <div className="flex gap-2">
                                    {product.links.wb && (
                                      <a href={product.links.wb} target="_blank" rel="noreferrer" className="flex-1 bg-purple-700 hover:bg-purple-600 text-white text-[10px] sm:text-xs font-bold uppercase py-2 rounded text-center">
                                        Wildberries
                                      </a>
                                    )}
                                    {product.links.ozon && (
                                      <a href={product.links.ozon} target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-bold uppercase py-2 rounded text-center">
                                        Ozon
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div >

      {/* Кнопка открытия Мастерской Эскизов */}
      <div className="w-full max-w-md my-8">
        <button
          onClick={() => setIsPromoModalOpen(true)}
          className="w-full relative group overflow-hidden rounded-xl border border-zinc-700 hover:border-orange-500 transition-all duration-500 shadow-2xl"
        >
          <div className="absolute inset-0">
            <img
              src="/images/oracle_bg.png"
              alt=""
              className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500 scale-100 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>

          <div className="relative z-10 p-8 text-center">
            <h2 className="text-2xl font-serif text-white uppercase tracking-widest mb-2 group-hover:text-orange-500 transition-colors">
              Мастерская Эскизов
            </h2>
            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-6 group-hover:text-zinc-300 transition-colors">
              Создай свой уникальный дизайн для топора
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-2 border border-zinc-600 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-300 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.077-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.048 4.053a15.971 15.971 0 01-2.429-2.28m2.43 2.28l1.638-1.802m0 0a1.125 1.125 0 010-1.606l8.834-8.835a2.25 2.25 0 013.182 0l1.24 1.24a2.25 2.25 0 010 3.182l-8.835 8.834a1.125 1.125 0 01-1.606 0l-1.802 1.639" />
              </svg>
              Открыть Генератор
            </div>
          </div>
        </button>
      </div>

      {/* Promo Code Modal */}
      <AnimatePresence>
        {isPromoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsPromoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-700 p-8 rounded-xl w-full max-w-md shadow-2xl text-center relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <img src="/images/oracle_bg.png" alt="" className="w-full h-full object-contain" />
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-6">
                  Доступ к Мастерской
                </h3>

                {!promoError ? (
                  <>
                    <p className="text-zinc-400 text-sm mb-4">
                      Введите секретный код доступа, чтобы открыть генератор.
                    </p>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Введите код"
                      className="w-full bg-black border border-zinc-700 p-3 text-center text-white focus:border-orange-500 outline-none transition-colors rounded mb-4"
                      autoFocus
                    />
                    <button
                      onClick={handlePromoSubmit}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase rounded transition-all shadow-lg hover:shadow-orange-500/20"
                    >
                      Войти
                    </button>
                  </>
                ) : (
                  <div className="animate-shake">
                    <p className="text-red-500 font-bold mb-2">Неверный код!</p>
                    <p className="text-zinc-400 text-sm mb-6">
                      Для получения кода обратитесь к Мастеру.
                    </p>

                    <a
                      href={CONTACTS.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-[#229ED9] hover:bg-[#1E8BBF] text-white font-bold uppercase rounded transition-all mb-3 flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.02-2.38-1.63-1.05-.69-.37-1.07.23-1.68.15-.15 2.81-2.57 2.86-2.79.01-.05.01-.1-.02-.14-.03-.04-.08-.06-.11-.04-.08.02-1.29.82-3.64 2.41-.34.23-.66.35-.97.35-.32-.01-.94-.18-1.4-.33-.56-.18-1.01-.28-1.04-.58.02-.16.24-.32.65-.49 2.54-1.1 4.23-1.84 5.08-2.19 2.42-.99 2.92-1.16 3.25-1.16.07 0 .23.01.33.09.09.07.12.17.12.27 0 .1 0 .2-.01.24z" /></svg>
                      Написать Мастеру
                    </a>

                    <button
                      onClick={() => { setPromoError(false); setPromoCode(''); }}
                      className="text-zinc-500 text-xs uppercase hover:text-white transition-colors border-b border-transparent hover:border-white"
                    >
                      Попробовать снова
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {isSketchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] overflow-y-auto bg-black/95 backdrop-blur-md"
            onClick={() => setIsSketchOpen(false)}
          >
            <div className="flex min-h-full items-start md:items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl relative my-8 md:my-0"
              >
                <button
                  onClick={() => setIsSketchOpen(false)}
                  className="absolute -top-12 right-0 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 uppercase text-xs font-bold tracking-widest"
                >
                  Закрыть
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                  <SketchGenerator usageLimit={promoUseLimit} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer: Подписка и Отзывы */}
      <div className="w-full max-w-2xl mt-12 space-y-8">
        {/* Подписка */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <img src="/images/oracle_bg.png" alt="" className="w-full h-full object-contain" />
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-serif text-lg mb-2">Хочешь знать больше о силе знаков?</h3>
            <p className="text-zinc-400 text-sm mb-4">Подписывайся на закрытый канал мастерской</p>
            <a
              href="https://t.me/topordorf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#229ED9] hover:bg-[#1E8BBF] text-white font-bold uppercase rounded-full transition-all shadow-lg hover:shadow-blue-500/30 gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.02-2.38-1.63-1.05-.69-.37-1.07.23-1.68.15-.15 2.81-2.57 2.86-2.79.01-.05.01-.1-.02-.14-.03-.04-.08-.06-.11-.04-.08.02-1.29.82-3.64 2.41-.34.23-.66.35-.97.35-.32-.01-.94-.18-1.4-.33-.56-.18-1.01-.28-1.04-.58.02-.16.24-.32.65-.49 2.54-1.1 4.23-1.84 5.08-2.19 2.42-.99 2.92-1.16 3.25-1.16.07 0 .23.01.33.09.09.07.12.17.12.27 0 .1 0 .2-.01.24z" /></svg>
              Перейти в Telegram
            </a>
          </div>
        </div>

        {/* Отзывы */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Иван, г. Тверь", text: "Заказывал топор с Велесом. Работа — огонь, чувствуется мощь в руке." },
            { name: "Ольга, Москва", text: "Амулет пришел быстро. Очень красивая детализация, ношу не снимая." },
            { name: "Дмитрий, Екб", text: "Мастера своего дела. Тотем определили верно, характер совпал на 100%." }
          ].map((review, i) => (
            <div key={i} className="bg-black/40 border border-zinc-800 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2 text-amber-500 text-xs">★★★★★</div>
              <p className="text-zinc-300 text-xs italic mb-3">"{review.text}"</p>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{review.name}</p>
            </div>
          ))}
        </div>
      </div>

      <DailyOracle
        isOpen={isOracleOpen}
        onClose={() => setIsOracleOpen(false)}
        telegramLink={CONTACTS.telegram}
      />

      {/* Модальное окно "Легенда" */}
      <AnimatePresence>
        {isLegendOpen && recommendedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsLegendOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-amber-500/30 p-8 rounded-xl w-full max-w-md shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <img src="/images/oracle_bg.png" alt="" className="w-3/4 object-contain brightness-50" />
              </div>

              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold text-amber-500 uppercase tracking-widest font-serif mb-4 drop-shadow-sm">
                  {recommendedProduct.name}
                </h3>
                <div className="w-16 h-0.5 bg-amber-500/50 mx-auto mb-6"></div>
                <p className="text-zinc-200 text-base leading-relaxed font-serif italic whitespace-pre-line">
                  {recommendedProduct.longDescription}
                </p>
              </div>

              <button
                onClick={() => setIsLegendOpen(false)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-bold uppercase rounded transition-colors tracking-widest text-xs relative z-10"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}

export default App;
