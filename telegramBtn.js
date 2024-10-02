
const categoriesButtons = [
    [{ text: 'Недвижимость', callback_data: 'c___Недвижимость' },{ text: 'Авто и запчасти', callback_data: 'c___Авто и запчасти' }],
    [{ text: 'Бытовая техника', callback_data: 'c___Бытовая техника' },{ text: 'Компьютерная техника', callback_data: 'c___Компьютерная техника' }],
    [{ text: 'Телефоны и планшеты', callback_data: 'c___Телефоны и планшеты' },{ text: 'Электроника', callback_data: 'c___Электроника' }],
    [{ text: 'Женский гардероб', callback_data: 'c___Женский гардероб' },{ text: 'Мужской гардероб', callback_data: 'c___Мужской гардероб' }],
    [{ text: 'Красота и здоровье', callback_data: 'c___Красота и здоровье' },{ text: 'Всё для детей и мам', callback_data: 'c___Всё для детей и мам' }],
    [{ text: 'Мебель', callback_data: 'c___Мебель' },{ text: 'Все для дома', callback_data: 'c___Все для дома' }],
    [{ text: 'Ремонт и стройка', callback_data: 'c___Ремонт и стройка' },{ text: 'Сад и огород', callback_data: 'c___Сад и огород' }],
    [{ text: 'Хобби, спорт и туризм', callback_data: 'c___Хобби, спорт и туризм' },{ text: 'Свадьба и праздники', callback_data: 'c___Свадьба и праздники' }],
    [{ text: 'Животные', callback_data: 'c___Животные' },{ text: 'Готовый бизнес и оборудование', callback_data: 'c___Готовый бизнес и оборудование' }],
    [{ text: 'Работа', callback_data: 'c___Работа' },{ text: 'Услуги', callback_data: 'c___Услуги' }],
    [{ text: 'Прочее', callback_data: 'c___Прочее' }]
];

const categoriesOpts = {
    reply_markup: {
        inline_keyboard: categoriesButtons
    },
    parse_mode: 'HTML'
};



//////////////

const subCategoryBtn_1000 = [
    [{ text: 'По всей категории', callback_data: 'с_01_По всей категории' }],
    [{ text: 'Новостройки', callback_data: 'с_01_Новостройки' },{ text: 'Квартиры', callback_data: 'с_01_Квартиры' }],
    [{ text: 'Комнаты', callback_data: 'с_01_Комнаты' },{ text: 'Дома, дачи, коттеджи', callback_data: 'с_01_Дома, дачи, коттеджи' }],
    [{ text: 'Гаражи и стоянки', callback_data: 'с_01_Гаражи и стоянки' },{ text: 'Участки', callback_data: 'с_01_Участки' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
    
];
const subCategoryBtn_2000 = [
    [{ text: 'По всей категории', callback_data: 'с_02_По всей категории' }],
    [{ text: 'Легковые авто', callback_data: 'с_02_Легковые авто' },{ text: 'Запчасти', callback_data: 'с_02_Запчасти' }],
    [{ text: 'Грузовики и автобусы', callback_data: 'с_02_Грузовики и автобусы' },{ text: 'Мототехника', callback_data: 'с_02_Мототехника' }],
    [{ text: 'Сельхозтехника', callback_data: 'с_02_Сельхозтехника' },{ text: 'Спецтехника', callback_data: 'с_02_Спецтехника' }],
    [{ text: 'Прицепы', callback_data: 'с_02_Прицепы' },{ text: 'Водный транспорт', callback_data: 'с_02_Водный транспорт' }],
    [{ text: 'Автокресла и бустеры', callback_data: 'с_02_Автокресла и бустеры' },{ text: 'Аксессуары', callback_data: 'с_02_Аксессуары' }],
    [{ text: 'Шины, диски', callback_data: 'с_02_Шины, диски' },{ text: 'Инструмент, оборудование', callback_data: 'с_02_Инструмент, оборудование' }],
    [{ text: 'Автохимия и автомасла', callback_data: 'с_02_Автохимия и автомасла' },{ text: 'Услуги для авто', callback_data: 'с_02_Услуги для авто' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_15000 = [
    [{ text: 'По всей категории', callback_data: 'с_15_По всей категории' }],
    [{ text: 'Техника для кухни', callback_data: 'с_15_Техника для кухни' },{ text: 'Крупная техника для кухни', callback_data: 'с_15_Крупная техника для кухни' }],
    [{ text: 'Техника для уборки', callback_data: 'с_15_Техника для уборки' },{ text: 'Уход за одеждой, пошив', callback_data: 'с_15_Уход за одеждой, пошив' }],
    [{ text: 'Климатическая техника', callback_data: 'с_15_Климатическая техника' },{ text: 'Техника для красоты и здоровья', callback_data: 'с_15_Техника для красоты и здоровья' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_16000 = [
    [{ text: 'По всей категории', callback_data: 'с_16_По всей категории' }],
    [{ text: 'Ноутбуки', callback_data: 'с_16_Ноутбуки' },{ text: 'Компьютеры / системные блоки', callback_data: 'с_16_Компьютеры / системные блоки' }],
    [{ text: 'Мониторы', callback_data: 'с_16_Мониторы' },{ text: 'Комплектующие', callback_data: 'с_16_Комплектующие' }],
    [{ text: 'Оргтехника', callback_data: 'с_16_Оргтехника' },{ text: 'Периферия и аксессуары', callback_data: 'с_16_Периферия и аксессуары' }],
    [{ text: 'Сетевое оборудование', callback_data: 'с_16_Сетевое оборудование' },{ text: 'Прочие компьютерные товары', callback_data: 'с_16_Прочие компьютерные товары' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_17000 = [
    [{ text: 'По всей категории', callback_data: 'с_17_По всей категории' }],
    [{ text: 'Мобильные телефоны', callback_data: 'с_17_Мобильные телефоны' },{ text: 'Комплектующие для телефонов', callback_data: 'с_17_Комплектующие для телефонов' }],
    [{ text: 'Аксессуары для телефонов', callback_data: 'с_17_Аксессуары для телефонов' },{ text: 'Телефония и связь', callback_data: 'с_17_Телефония и связь' }],
    [{ text: 'Планшеты', callback_data: 'с_17_Планшеты' },{ text: 'Графические планшеты', callback_data: 'с_17_Графические планшеты' }],
    [{ text: 'Электронные книги', callback_data: 'с_17_Электронные книги' },{ text: 'Умные часы и фитнес-браслеты', callback_data: 'с_17_Умные часы и фитнес-браслеты' }],
    [{ text: 'Аксессуары для планшетов и книг', callback_data: 'с_17_Аксессуары для планшетов и книг' },{ text: 'Наушники', callback_data: 'с_17_Наушники' }] ,
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_5000 = [
    [{ text: 'По всей категории', callback_data: 'с_05_По всей категории' }],
    [{ text: 'Аудиотехника', callback_data: 'с_05_Аудиотехника' },{ text: 'Наушники', callback_data: 'с_05_Наушники' }],
    [{ text: 'ТВ и видеотехника', callback_data: 'с_05_ТВ и видеотехника' },{ text: 'Фототехника и оптика', callback_data: 'с_05_Фототехника и оптика' }],
    [{ text: 'Игры и приставки', callback_data: 'с_05_Игры и приставки' },{ text: 'Безопасность и умный дом', callback_data: 'с_05_Безопасность и умный дом' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_8000 = [
    [{ text: 'По всей категории', callback_data: 'с_08_По всей категории' }],
    [{ text: 'Премиум одежда', callback_data: 'с_08_Премиум одежда' },{ text: 'Женская одежда', callback_data: 'с_08_Женская одежда' }],
    [{ text: 'Женская обувь', callback_data: 'с_08_Женская обувь' },{ text: 'Женские аксессуары', callback_data: 'с_08_Женские аксессуары' }],
    [{ text: 'Ремонт и пошив одежды', callback_data: 'с_08_Ремонт и пошив одежды' },{ text: 'Одежда для беременных', callback_data: 'с_08_Одежда для беременных' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_19000 = [
    [{ text: 'По всей категории', callback_data: 'с_19_По всей категории' }],
    [{ text: 'Мужская одежда', callback_data: 'с_19_Мужская одежда' },{ text: 'Мужская обувь', callback_data: 'с_19_Мужская обувь' }],
    [{ text: 'Мужские аксессуары', callback_data: 'с_19_Мужские аксессуары' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_18000 = [
    [{ text: 'По всей категории', callback_data: 'с_18_По всей категории' }],
    [{ text: 'Декоративная косметика', callback_data: 'с_18_Декоративная косметика' },{ text: 'Уходовая косметика', callback_data: 'с_18_Уходовая косметика' }],
    [{ text: 'Парфюмерия', callback_data: 'с_18_Парфюмерия' },{ text: 'Маникюр, педикюр', callback_data: 'с_18_Маникюр, педикюр' }],
    [{ text: 'Средства для волос', callback_data: 'с_18_Средства для волос' },{ text: 'Средства гигиены, депиляция', callback_data: 'с_18_Средства гигиены, депиляция' }],
    [{ text: 'Ресницы и брови, татуаж', callback_data: 'с_18_Ресницы и брови, татуаж' },{ text: 'Косметические аксессуары', callback_data: 'с_18_Косметические аксессуары' }],
    [{ text: 'Медицинские товары', callback_data: 'с_18_Медицинские товары' },{ text: 'Техника для красоты и здоровья', callback_data: 'с_18_Техника для красоты и здоровья' }],
    [{ text: 'Услуги: красота и здоровье', callback_data: 'с_18_Услуги: красота и здоровье' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_12000 = [
    [{ text: 'По всей категории', callback_data: 'с_12_По всей категории' }],
    [{ text: 'Одежда до 1 года', callback_data: 'с_12_Одежда до 1 года' },{ text: 'Одежда для девочек', callback_data: 'с_12_Одежда для девочек' }],
    [{ text: 'Одежда для мальчиков', callback_data: 'с_12_Одежда для мальчиков' },{ text: 'Аксессуары для детей', callback_data: 'с_12_Аксессуары для детей' }],
    [{ text: 'Детская обувь', callback_data: 'с_12_Детская обувь' },{ text: 'Ходунки, шезлонги, качели', callback_data: 'с_12_Ходунки, шезлонги, качели' }],
    [{ text: 'Коляски', callback_data: 'с_12_Коляски' },{ text: 'Автокресла и бустеры', callback_data: 'с_12_Автокресла и бустеры' }],
    [{ text: 'Кормление и уход', callback_data: 'с_12_Кормление и уход' },{ text: 'Текстиль для детей', callback_data: 'с_12_Текстиль для детей' }],
    [{ text: 'Сумки-кенгуру и слинги', callback_data: 'с_12_Сумки-кенгуру и слинги' },{ text: 'Игрушки и книги', callback_data: 'с_12_Игрушки и книги' }],
    [{ text: 'Детский транспорт', callback_data: 'с_12_Детский транспорт' },{ text: 'Товары для мам', callback_data: 'с_12_Товары для мам' }],
    [{ text: 'Одежда для беременных', callback_data: 'с_12_Одежда для беременных' },{ text: 'Прочие товары для детей', callback_data: 'с_12_Прочие товары для детей' }],
    [{ text: 'Детская мебель', callback_data: 'с_12_Детская мебель' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_21000 = [
    [{ text: 'По всей категории', callback_data: 'с_21_По всей категории' }],
    [{ text: 'Банкетки, пуфики', callback_data: 'с_21_Банкетки, пуфики' },{ text: 'Вешалки, прихожие', callback_data: 'с_21_Вешалки, прихожие' }],
    [{ text: 'Детская мебель', callback_data: 'с_21_Детская мебель' },{ text: 'Комоды', callback_data: 'с_21_Комоды' }],
    [{ text: 'Кровати,матрасы', callback_data: 'с_21_Кровати,матрасы' },{ text: 'Кухни', callback_data: 'с_21_Кухни' }],
    [{ text: 'Кухонные уголки', callback_data: 'с_21_Кухонные уголки' },{ text: 'Мягкая мебель', callback_data: 'с_21_Мягкая мебель' }],
    [{ text: 'Полки, стеллажи, шкафчики', callback_data: 'с_21_Полки, стеллажи, шкафчики' },{ text: 'Спальные гарнитуры', callback_data: 'с_21_Спальные гарнитуры' }],
    [{ text: 'Стенки, секции, модули', callback_data: 'с_21_Стенки, секции, модули' },{ text: 'Столы и обеденные группы', callback_data: 'с_21_Столы и обеденные группы' }],
    [{ text: 'Стулья', callback_data: 'с_21_Стулья' },{ text: 'Тумбы, буфеты', callback_data: 'с_21_Тумбы, буфеты' }],
    [{ text: 'Шкафы', callback_data: 'с_21_Шкафы' }],
    [{ text: 'Мебельная фурнитура и составл.', callback_data: 'с_21_Мебельная фурнитура и составл.' }],
    [{ text: 'Прочая мебель', callback_data: 'с_21_Прочая мебель' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_3000 = [
    [{ text: 'По всей категории', callback_data: 'с_03_По всей категории' }],
    [{ text: 'Предметы интерьера, зеркала', callback_data: 'с_03_Предметы интерьера, зеркала' },{ text: 'Шторы, жалюзи, карнизы', callback_data: 'с_03_Шторы, жалюзи, карнизы' }],
    [{ text: 'Текстиль и ковры', callback_data: 'с_03_Текстиль и ковры' },{ text: 'Освещение', callback_data: 'с_03_Освещение' }],
    [{ text: 'Хозяйственные товары', callback_data: 'с_03_Хозяйственные товары' },{ text: 'Посуда и кухонные аксессуары', callback_data: 'с_03_Посуда и кухонные аксессуары' }],
    [{ text: 'Комнатные растения', callback_data: 'с_03_Комнатные растения' },{ text: 'Бытовые услуги', callback_data: 'с_03_Бытовые услуги' }],
    [{ text: 'Ремонт, сборка, перетяжка мебели', callback_data: 'с_03_Ремонт' }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_14000 = [
    [{ text: 'По всей категории', callback_data: 'с_14_По всей категории' }],
    [{ text: 'Строительный инструмент', callback_data: 'с_14_Строительный инструмент' },{ text: "Строительное оборудование", callback_data: "с_14_Строительное оборудование" }],
    [{ text: "Сантехника и отопление", callback_data: "с_14_Сантехника и отопление" },{ text: "Стройматериалы", callback_data: "с_14_Стройматериалы" }],
    [{ text: "Отделочные материалы", callback_data: "с_14_Отделочные материалы" },{ text: "Окна и двери", callback_data: "с_14_Окна и двери" }],
    [{ text: "Дома, срубы и сооружения", callback_data: "с_14_Дома, срубы и сооружения" },{ text: "Ворота, заборы", callback_data: "с_14_Ворота, заборы" }],
    [{ text: "Электроснабжение", callback_data: "с_14_Электроснабжение" },{ text: "Средства индивидуальной защиты", callback_data: "с_14_Средства индивидуальной защиты" }],
    [{ text: "Прочее для ремонта и стройки", callback_data: "с_14_Прочее для ремонта и стройки" },{ text: "Строительные работы", callback_data: "с_14_Строительные работы" }],
    [{ text: "Ремонт квартиры, дома", callback_data: "с_14_Ремонт квартиры, дома" }] ,
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_10000 = [
    [{ text: 'По всей категории', callback_data: 'с_10_По всей категории' }],
    [{ text: "Садовая мебель и бассейны", callback_data: "с_10_Садовая мебель и бассейны" },{ text: "Мангалы, аксессуары, топливо", callback_data: "с_10_Мангалы, аксессуары, топливо" }],
    [{ text: "Мотоблоки и культиваторы", callback_data: "с_10_Мотоблоки и культиваторы" },{ text: "Садовая техника", callback_data: "с_10_Садовая техника" }],
    [{ text: "Садовый инвентарь", callback_data: "с_10_Садовый инвентарь" },{ text: "Теплицы и парники", callback_data: "с_10_Теплицы и парники" }],
    [{ text: "Растения, рассада и семена", callback_data: "с_10_Растения, рассада и семена" },{ text: "Удобрения и агрохимия", callback_data: "с_10_Удобрения и агрохимия" }],
    [{ text: "Все для пчеловода", callback_data: "с_10_Все для пчеловода" },{ text: "Бани, хозблоки, санузлы", callback_data: "с_10_Бани, хозблоки, санузлы" }],
    [{ text: "Прочее для сада и огорода", callback_data: "с_10_Прочее для сада и огорода" },{ text: "Комнатные растения", callback_data: "с_10_Комнатные растения" }],
    [{ text: "Cельхозтехника", callback_data: "с_10_Cельхозтехника" },{ text: "Срубы, бытовки, кунги", callback_data: "с_10_Срубы, бытовки, кунги" }],
    [{ text: "Услуги: cад, благоустройство", callback_data: "с_10_Услуги: cад, благоустройство" }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_4000 = [
    [{ text: 'По всей категории', callback_data: 'с_04_По всей категории' }],
    [{ text: "CD, DVD, пластинки", callback_data: "с_04_CD, DVD, пластинки" },{ text: "Антиквариат и коллекции", callback_data: "с_04_Антиквариат и коллекции" }],
    [{ text: "Билеты", callback_data: "с_04_Билеты" },{ text: "Книги и журналы", callback_data: "с_04_Книги и журналы" }],
    [{ text: "Металлоискатели", callback_data: "с_04_Металлоискатели" },{ text: "Музыкальные инструменты", callback_data: "с_04_Музыкальные инструменты" }],
    [{ text: "Настольные игры и пазлы", callback_data: "с_04_Настольные игры и пазлы" },{ text: "Охота и рыбалка", callback_data: "с_04_Охота и рыбалка" }],
    [{ text: "Туристические товары", callback_data: "с_04_Туристические товары" },{ text: "Радиоуправляемые модели", callback_data: "с_04_Радиоуправляемые модели" }],
    [{ text: "Рукоделие", callback_data: "с_04_Рукоделие" },{ text: "Спорттовары", callback_data: "с_04_Спорттовары" }],
    [{ text: "Велосипеды", callback_data: "с_04_Велосипеды" },{ text: "Электротранспорт", callback_data: "с_04_Электротранспорт" }],
    [{ text: "Туристические услуги", callback_data: "с_04_Туристические услуги" },{ text: "Прочее в Хобби, спорт и туризм", callback_data: "с_04_Прочее в Хобби, спорт и туризм" }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_9000 = [
    [{ text: 'По всей категории', callback_data: 'с_09_По всей категории' }],
    [{ text: "Свадебные платья", callback_data: "с_09_Свадебные платья" },{ text: "Свадебные костюмы", callback_data: "с_09_Свадебные костюмы" }],
    [{ text: "Свадебная обувь", callback_data: "с_09_Свадебная обувь" },{ text: "Свадебные аксессуары", callback_data: "с_09_Свадебные аксессуары" }],
    [{ text: "Подарки и праздничные товары", callback_data: "с_09_Подарки и праздничные товары" },{ text: "Карнавальные костюмы", callback_data: "с_09_Карнавальные костюмы" }],
    [{ text: "Услуги для торжеств", callback_data: "с_09_Услуги для торжеств" }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_11000 = [
    [{ text: 'По всей категории', callback_data: 'с_11_По всей категории' }],
    [{ text: "Домашние питомцы", callback_data: "с_11_Домашние питомцы" },{ text: "Сельхоз животные", callback_data: "с_11_Сельхоз животные" }],
    [{ text: "Товары для животных", callback_data: "с_11_Товары для животных" },{ text: "Вязка животных", callback_data: "с_11_Вязка животных" }],
    [{ text: "Услуги для животных", callback_data: "с_11_Услуги для животных" }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_20000 = [
    [{ text: 'По всей категории', callback_data: 'с_20_По всей категории' }],
    [{ text: 'Готовый бизнес', callback_data: 'с_20_Готовый бизнес' },{ text: "Оборудование для бизнеса", callback_data: "с_20_Оборудование для бизнеса" }] ,
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_6000 = [
    [{ text: 'По всей категории', callback_data: 'с_06_По всей категории' }],
    [{ text: "Вакансии", callback_data: "с_06_Вакансии" },{ text: "Ищу работу", callback_data: "с_06_Ищу работу" }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_13000 = [
    [{ text: 'По всей категории', callback_data: 'с_13_По всей категории' }],
    [{ text: "Услуги для авто", callback_data: "с_13_Услуги для авто" },{ text: "Бытовые услуги", callback_data: "с_13_Бытовые услуги" }],
    [{ text: "Компьютерные услуги, интернет", callback_data: "с_13_Компьютерные услуги, интернет" },{ text: "Ремонт техники и электроники", callback_data: "с_13_Ремонт техники и электроники" }],
    [{ text: "Красота и здоровье", callback_data: "с_13_Красота и здоровье" },{ text: "Няни и сиделки", callback_data: "с_13_Няни и сиделки" }],
    [{ text: "Образовательные услуги", callback_data: "с_13_Образовательные услуги" },{ text: "Услуги переводчика, секретаря", callback_data: "с_13_Услуги переводчика, секретаря" }],
    [{ text: "Перевозки пассажиров и грузов", callback_data: "с_13_Перевозки пассажиров и грузов" },{ text: "Реклама, полиграфия", callback_data: "с_13_Реклама, полиграфия" }],
    [{ text: "Строительные работы", callback_data: "с_13_Строительные работы" },{ text: "Ремонт квартиры, дома", callback_data: "с_13_Ремонт квартиры, дома" }],
    [{ text: "Ремонт, сборка, перетяжка мебели", callback_data: "с_13_Ремонт, сборка, перетяжка" },{ text: "Ремонт и пошив одежды", callback_data: "с_13_Ремонт и пошив одежды" }],
    [{ text: "Сад, благоустройство", callback_data: "с_13_Сад, благоустройство" },{ text: "Услуги для животных", callback_data: "с_13_Услуги для животных" }],
    [{ text: "Фото и видеосъемка", callback_data: "с_13_Фото и видеосъемка" },{ text: "Юридические услуги", callback_data: "с_13_Юридические услуги" }],
    [{ text: "Туристические услуги", callback_data: "с_13_Туристические услуги" },{ text: "Услуги для торжеств", callback_data: "с_13_Услуги для торжеств" }],
    [{ text: "Аренда бань и беседок", callback_data: "с_13_Аренда бань и беседок" },{ text: "Прочие услуги", callback_data: "с_13_Прочие услуги" }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];
const subCategoryBtn_7000 = [
    [{ text: 'По всей категории', callback_data: 'с_07_По всей категории' }],
    [{ text: "Бюро находок", callback_data: "с_07_Бюро находок" },{ text: "Кальяны", callback_data: "с_07_Кальяны" }],
    [{ text: "Канцелярские товары", callback_data: "с_07_Канцелярские товары" },{ text: "Продукты питания", callback_data: "с_07_Продукты питания" }],
    [{ text: "Электронные парогенераторы", callback_data: "с_07_Электронные парогенераторы" },{ text: "Спрос", callback_data: "с_07_Спрос" }],
    [{ text: "Все остальное", callback_data: "с_07_Все остальное" }],
    [{ text: 'Назад', callback_data: 'с_Назад' }]
];


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



const statesButtons = [
    [{ text: 'Брестская', callback_data: 's___Брестская' },{ text: 'Гомельская', callback_data: 's___Гомельская' },{ text: 'Гродненская', callback_data: 's___Гродненская' }],
    [{ text: 'Могилевская', callback_data: 's___Могилевская' },{ text: 'Минская', callback_data: 's___Минская' },{ text: 'Витебская', callback_data: 's___Витебская' }],
    [{ text: 'Минск', callback_data: 's___Минск' }],
    [{ text: 'Вся Беларусь', callback_data: 's___Вся Беларусь' }]
];

const statesOpts = {
    reply_markup: {
        inline_keyboard: statesButtons
    },
    parse_mode: 'HTML'
};




////////////
const subTownBtn_Minsk = [
    [{ text: 'По всему Минску', callback_data: 's_07_Минск'}],
    [{ text: 'Центральный', callback_data: 's_07_Центральный' },{ text: 'Советский', callback_data: 's_07_Советский' },{ text: 'Первомайский', callback_data: 's_07_Первомайский' }],
    [{ text: 'Партизанский', callback_data: 's_07_Партизанский' },{ text: 'Заводской', callback_data: 's_07_Заводской' },{ text: 'Ленинский', callback_data: 's_07_Ленинский' }],
    [{ text: 'Октябрьский', callback_data: 's_07_Октябрьский' },{ text: 'Московский', callback_data: 's_07_Московский' },{ text: 'Фрунзенский', callback_data: 's_07_Фрунзенский' }],
    [{ text: 'Назад', callback_data: 's_Назад' }]
];

const subTownBtn_Brestskaya = [
    [{ text: 'По всей Брестской области', callback_data: 's_01_Брестская область' }],
    [{ text: 'Брест', callback_data: 's_01_Брест' },{ text: 'Барановичи', callback_data: 's_01_Барановичи' },{ text: 'Береза', callback_data: 's_01_Береза' }],
    [{ text: 'Белоозёрск', callback_data: 's_01_Белоозёрск' },{ text: 'Высокое', callback_data: 's_01_Высокое' },{ text: 'Ганцевичи', callback_data: 's_01_Ганцевичи' }],
    [{ text: 'Давид - Городок', callback_data: 's_01_Давид - Городок' },{ text: 'Дрогичин', callback_data: 's_01_Дрогичин' },{ text: 'Жабинка', callback_data: 's_01_Жабинка' }],
    [{ text: 'Жабинка', callback_data: 's_01_Жабинка' },{ text: 'Иваново', callback_data: 's_01_Иваново' },{ text: 'Ивацевичи', callback_data: 's_01_Ивацевичи' }],
    [{ text: 'Каменец', callback_data: 's_01_Каменец' },{ text: 'Кобрин', callback_data: 's_01_Кобрин' },{ text: 'Лунинец', callback_data: 's_01_Лунинец' }],
    [{ text: 'Ляховичи', callback_data: 's_01_Ляховичи' },{ text: 'Малорита', callback_data: 's_01_Малорита' },{ text: 'Микашевичи', callback_data: 's_01_Микашевичи' }],
    [{ text: 'Пинск', callback_data: 's_01_Пинск' },{ text: 'Пружаны', callback_data: 's_01_Пружаны' },{ text: 'Столин', callback_data: 's_01_Столин' }],
    [{ text: 'Другие города', callback_data: 's_01_Другие города' }],
    [{ text: 'Назад', callback_data: 's_Назад' }]
];

const subTownBtn_Gomelskaya = [
    [{ text: 'По всей Гомельской области', callback_data: 's_02_Гомельская область' }],
    [{ text: 'Гомель', callback_data: 's_02_Гомель' },{ text: 'Брагин', callback_data: 's_02_Брагин' },{ text: 'Буда-Кошелево', callback_data: 's_02_Буда-Кошелево' }],
    [{ text: 'Василевичи', callback_data: 's_02_Василевичи' },{ text: 'Ветка', callback_data: 's_02_Ветка' },{ text: 'Добруш', callback_data: 's_02_Добруш' }],
    [{ text: 'Ельск', callback_data: 's_02_Ельск' },{ text: 'Житковичи', callback_data: 's_02_Житковичи' },{ text: 'Жлобин', callback_data: 's_02_Жлобин' }],
    [{ text: 'Калинковичи', callback_data: 's_02_Калинковичи' },{ text: 'Корма', callback_data: 's_02_Корма' },{ text: 'Лельчицы', callback_data: 's_02_Лельчицы' }],
    [{ text: 'Лоев', callback_data: 's_02_Лоев' },{ text: 'Мозырь', callback_data: 's_02_Мозырь' },{ text: 'г.п. Октябрьский', callback_data: 's_02_г.п. Октябрьский' }],
    [{ text: 'Наровля', callback_data: 's_02_Наровля' },{ text: 'Петриков', callback_data: 's_02_Петриков' },{ text: 'Речица', callback_data: 's_02_Речица' }],
    [{ text: 'Рогачев', callback_data: 's_02_Рогачев' },{ text: 'Светлогорск', callback_data: 's_02_Светлогорск' },{ text: 'Хойники', callback_data: 's_02_Хойники' }],
    [{ text: 'Чечерск', callback_data: 's_02_Чечерск' },{ text: 'Другие города', callback_data: 's_02_Другие города' }],
    [{ text: 'Назад', callback_data: 's_Назад' }]
];

const subTownBtn_Grodnenskaya = [
    [{ text: 'По всей Могилевской области', callback_data: 's_03_Гродненская область' }],
    [{ text: 'Гродно', callback_data: 's_03_Гродно' },{ text: 'Березовка', callback_data: 's_03_Березовка' },{ text: 'Берестовица', callback_data: 's_03_Берестовица' }],
    [{ text: 'Волковыск', callback_data: 's_03_Волковыск' },{ text: 'Вороново', callback_data: 's_03_Вороново' },{ text: 'Дятлово', callback_data: 's_03_Дятлово' }],
    [{ text: 'Зельва', callback_data: 's_03_Зельва' },{ text: 'Ивье', callback_data: 's_03_Ивье' },{ text: 'Кореличи', callback_data: 's_03_Кореличи' }],
    [{ text: 'Лида', callback_data: 's_03_Лида' },{ text: 'Мосты', callback_data: 's_03_Мосты' },{ text: 'Новогрудок', callback_data: 's_03_Новогрудок' }],
    [{ text: 'Островец', callback_data: 's_03_Островец' },{ text: 'Ошмяны', callback_data: 's_03_Ошмяны' },{ text: 'Свислочь', callback_data: 's_03_Свислочь' }],
    [{ text: 'Скидель', callback_data: 's_03_Скидель' },{ text: 'Слоним', callback_data: 's_03_Слоним' },{ text: 'Сморгонь', callback_data: 's_03_Сморгонь' }],
    [{ text: 'Щучин', callback_data: 's_03_Щучин' },{ text: 'Другие города', callback_data: 's_03_Другие города' }],
    [{ text: 'Назад', callback_data: 's_Назад' }]
];

const subTownBtn_Mogilevskaya = [
    [{ text: 'По всей Могилевской области', callback_data: 's_04_Могилевская область' }],
    [{ text: 'Могилев', callback_data: 's_04_Могилев' },{ text: 'Белыничи', callback_data: 's_04_Белыничи' },{ text: 'Бобруйск', callback_data: 's_04_Бобруйск' }],
    [{ text: 'Быхов', callback_data: 's_04_Быхов' },{ text: 'Глуск', callback_data: 's_04_Глуск' },{ text: 'Горки', callback_data: 's_04_Горки' }],
    [{ text: 'Дрибин', callback_data: 's_04_Дрибин' },{ text: 'Кировск', callback_data: 's_04_Кировск' },{ text: 'Климовичи', callback_data: 's_04_Климовичи' }],
    [{ text: 'Кличев', callback_data: 's_04_Кличев' },{ text: 'Краснополье', callback_data: 's_04_Краснополье' },{ text: 'Круглое', callback_data: 's_04_Круглое' }],
    [{ text: 'Костюковичи', callback_data: 's_04_Костюковичи' },{ text: 'Кричев', callback_data: 's_04_Кричев' },{ text: 'Мстиславль', callback_data: 's_04_Мстиславль' }],
    [{ text: 'Осиповичи', callback_data: 's_04_Осиповичи' },{ text: 'Славгород', callback_data: 's_04_Славгород' },{ text: 'Чаусы', callback_data: 's_04_Чаусы' }],
    [{ text: 'Чериков', callback_data: 's_04_Чериков' },{ text: 'Шклов', callback_data: 's_04_Шклов' },{ text: 'Хотимск', callback_data: 's_04_Хотимск' }],
    [{ text: 'Другие города', callback_data: 's_04_Другие города' }],
    [{ text: 'Назад', callback_data: 's_Назад' }]
];

const subTownBtn_Minskaya = [
    [{ text: 'По всей Минской области', callback_data: 's_05_Минская область' }],
    [{ text: 'Минский район', callback_data: 's_05_Минский район' },{ text: 'Березино', callback_data: 's_05_Березино' },{ text: 'Борисов', callback_data: 's_05_Борисов' }],
    [{ text: 'Вилейка', callback_data: 's_05_Вилейка' },{ text: 'Воложин', callback_data: 's_05_Воложин' },{ text: 'Дзержинск', callback_data: 's_05_Дзержинск' }],
    [{ text: 'Жодино', callback_data: 's_05_Жодино' },{ text: 'Заславль', callback_data: 's_05_Заславль' },{ text: 'Клецк', callback_data: 's_05_Клецк' }],
    [{ text: 'Копыль', callback_data: 's_05_Копыль' },{ text: 'Крупки', callback_data: 's_05_Крупки' },{ text: 'Логойск', callback_data: 's_05_Логойск' }],
    [{ text: 'Любань', callback_data: 's_05_Любань' },{ text: 'Марьина Горка', callback_data: 's_05_Марьина Горка' },{ text: 'Молодечно', callback_data: 's_05_Молодечно' }],
    [{ text: 'Мядель', callback_data: 's_05_Мядель' },{ text: 'Несвиж', callback_data: 's_05_Несвиж' },{ text: 'Руденск', callback_data: 's_05_Руденск' }],
    [{ text: 'Слуцк', callback_data: 's_05_Слуцк' },{ text: 'Смолевичи', callback_data: 's_05_Смолевичи' },{ text: 'Солигорск', callback_data: 's_05_Солигорск' }],
    [{ text: 'Старые Дороги', callback_data: 's_05_Старые Дороги' },{ text: 'Столбцы', callback_data: 's_05_Столбцы' },{ text: 'Узда', callback_data: 's_05_Узда' }],
    [{ text: 'Фаниполь', callback_data: 's_05_Фаниполь' },{ text: 'Червень', callback_data: 's_05_Червень' },{ text: 'Другие города', callback_data: 's_05_Другие города' }],
    [{ text: 'Назад', callback_data: 's_Назад' }]
];

const subTownBtn_Vitebskaya = [
    [{ text: 'По всей Витебской области', callback_data: 's_06_Витебская область' }],
    [{ text: 'Витебск', callback_data: 's_06_Витебск' }],
    [{ text: 'Сенно', callback_data: 's_06_Другие города' },{ text: 'Бешенковичи', callback_data: 's_06_Бешенковичи' },{ text: 'Барань', callback_data: 's_06_Барань' }],
    [{ text: 'Браслав', callback_data: 's_06_Браслав' },{ text: 'Верхнедвинск', callback_data: 's_06_Верхнедвинск' },{ text: 'Глубокое', callback_data: 's_06_Глубокое' }],
    [{ text: 'Городок', callback_data: 's_06_Городок' },{ text: 'Докшицы', callback_data: 's_06_Докшицы' },{ text: 'Дубровно', callback_data: 's_06_Дубровно' }],
    [{ text: 'Лепель', callback_data: 's_06_Лепель' },{ text: 'Лиозно', callback_data: 's_06_Лиозно' },{ text: 'Миоры', callback_data: 's_06_Миоры' },],
    [{ text: 'Новолукомль', callback_data: 's_06_Новолукомль' },{ text: 'Новополоцк', callback_data: 's_06_Новополоцк' },{ text: 'Орша', callback_data: 's_06_Орша' }],
    [{ text: 'Полоцк', callback_data: 's_06_Полоцк' },{ text: 'Поставы', callback_data: 's_06_Поставы' },{ text: 'Россоны', callback_data: 's_06_Россоны' }],
    [{ text: 'Сенно', callback_data: 's_06_Сенно' },{ text: 'Толочин', callback_data: 's_06_Толочин' },{ text: 'Ушачи', callback_data: 's_06_Ушачи' }],
    [{ text: 'Чашники', callback_data: 's_06_Чашники' },{ text: 'Шарковщина', callback_data: 's_06_Шарковщина' },{ text: 'Шумилино', callback_data: 's_06_Шумилино' }],
    [{ text: 'Назад', callback_data: 's_Назад' }]
];


module.exports = {
    categoriesOpts,
    categoriesButtons,
    subCategoryBtn_1000,
    subCategoryBtn_2000,
    subCategoryBtn_3000,
    subCategoryBtn_4000,
    subCategoryBtn_5000,
    subCategoryBtn_6000,
    subCategoryBtn_7000,
    subCategoryBtn_8000,
    subCategoryBtn_9000,
    subCategoryBtn_10000,
    subCategoryBtn_11000,
    subCategoryBtn_12000,
    subCategoryBtn_13000,
    subCategoryBtn_14000,
    subCategoryBtn_15000,
    subCategoryBtn_16000,
    subCategoryBtn_17000,
    subCategoryBtn_18000,
    subCategoryBtn_19000,
    subCategoryBtn_20000,
    subCategoryBtn_21000,

    statesOpts,
    statesButtons,
    subTownBtn_Minsk,
    subTownBtn_Brestskaya,
    subTownBtn_Gomelskaya,
    subTownBtn_Grodnenskaya,
    subTownBtn_Mogilevskaya,
    subTownBtn_Minskaya,
    subTownBtn_Vitebskaya
};




