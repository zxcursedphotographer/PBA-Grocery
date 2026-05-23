const productsData = {
  "Гречневая крупа": { protein: 12.6, fats: 3, carbs: 60, kcal: 330 },
  "Рис белый": { protein: 6.5, fats: 0.8, carbs: 77, kcal: 344 },
  "Овсяные хлопья": { protein: 12, fats: 6, carbs: 62, kcal: 350 },
};

const productsPrice = {
  "Гречневая крупа": 550,
  "Овсяные хлопья": 400,
  "Рис белый": 600,
};

// Переменные итогов дня и наш массив продуктов
let totalDailyKcal = 0,
  totalDailyProteins = 0,
  totalDailyFats = 0,
  totalDailyCarbs = 0;
let addedProducts = []; // Инициализируем массив для хранения списка съеденного

// Функция расчета
function calcPortion(value, weight) {
  if (!weight || isNaN(weight) || weight <= 0) return 0;
  return (value * weight) / 100;
}

// Сохранение данных (включая массив продуктов)
function saveData() {
  const stats = {
    kcal: totalDailyKcal,
    p: totalDailyProteins,
    f: totalDailyFats,
    c: totalDailyCarbs,
    products: addedProducts, // Сохраняем массив
  };
  localStorage.setItem("dailyStats", JSON.stringify(stats));
}

function updateTotalDisplay() {
  const display = document.querySelector("#total-display");
  if (display) {
    display.textContent = `Общий итог за день: 
    ${totalDailyKcal.toFixed(0)} ккал 
    | Б: ${totalDailyProteins.toFixed(1)} 
    | Ж: ${totalDailyFats.toFixed(1)} 
    | У: ${totalDailyCarbs.toFixed(1)}`;
  }
}

// Вспомогательная функция для создания HTML-строки в дневнике питания
function createDailyItemDOM(productObj) {
  const dailyList = document.querySelector("#daily-list");
  if (!dailyList) return;

  const row = document.createElement("div");
  row.classList.add("daily-item");
  row.innerHTML = `<span>🥑 ${productObj.title} (${productObj.weight}г): ${productObj.kcal.toFixed(0)} ккал</span> <button class="delete-btn">❌</button>`;
  dailyList.appendChild(row);

  // Логика удаления конкретного элемента
  row.querySelector(".delete-btn").addEventListener("click", () => {
    totalDailyKcal -= productObj.kcal;
    totalDailyProteins -= productObj.p;
    totalDailyFats -= productObj.f;
    totalDailyCarbs -= productObj.c;

    updateTotalDisplay();

    // Удаляем элемент из массива по его уникальному ID
    addedProducts = addedProducts.filter((item) => item.id !== productObj.id);

    saveData();
    row.remove();
  });
}

const allCards = document.querySelectorAll(".inventory-card");

allCards.forEach((card) => {
  const input = card.querySelector(".inventory-card__input");
  const titleElement = card.querySelector(".inventory-card__title");
  const title = titleElement.textContent.trim();
  const resField = card.querySelector(".inventory-card__result");
  const pField = card.querySelector(".js-proteins");
  const fField = card.querySelector(".js-fats");
  const cField = card.querySelector(".js-carbs");
  const addBtn = card.querySelector(".inventory-card__btn--add");
  const priceBtn = card.querySelector(".inventory-card_price--btnprice");
  const priceText = card.querySelector(".inventory-card__price");

  const data = productsData[title];
  let currentCalories = 0;
  const targetCalories = 2500;

  function updateProgressBar() {
    let percent = (currentCalories / targetCalories) * 100;
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;
    const energyBar = card.querySelector(".inventory-card__energy-bar");
    if (energyBar) {
      energyBar.style.width = percent + "%";
    }
  }

  if (data && input) {
    // ЛОГИКА ЖИВОГО РАСЧЕТА
    input.addEventListener("input", () => {
      let weight = parseFloat(input.value);

      if (weight > 1000) {
        resField.textContent = "Многовато! (макс. 1000г)";
        resField.style.color = "orange";
        pField.textContent = "0.0";
        fField.textContent = "0.0";
        cField.textContent = "0.0";
        currentCalories = 0;
      } else {
        let kcal = calcPortion(data.kcal, weight);
        let p = calcPortion(data.protein, weight);
        let f = calcPortion(data.fats, weight);
        let c = calcPortion(data.carbs, weight);

        resField.textContent = `Итого: ${kcal.toFixed(0)} ккал`;

        if (kcal > 500) {
          resField.style.color = "red";
          resField.style.fontWeight = "bold";
        } else if (kcal > 200) {
          resField.style.color = "orange";
          resField.style.fontWeight = "normal";
        } else {
          resField.style.color = "#06ff27";
          resField.style.fontWeight = "normal";
        }

        pField.textContent = p.toFixed(1);
        fField.textContent = f.toFixed(1);
        cField.textContent = c.toFixed(1);

        currentCalories = kcal;
      }
      updateProgressBar();
    });
  }

  // ЛОГИКА ЦЕНЫ
  if (priceBtn) {
    priceBtn.addEventListener("click", () => {
      const currentPrice = productsPrice[title];
      priceText.textContent = `Цена: ${currentPrice} тенге`;

      const oldTitle = titleElement.textContent;
      titleElement.textContent = "✅ Цена найдена!";

      setTimeout(() => {
        titleElement.textContent = oldTitle;
      }, 1500);
    });
  }

  // ЛОГИКА ДОБАВЛЕНИЯ
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      let weight = parseFloat(input.value);

      if (!weight || weight > 1000) return;

      let portionKcal = calcPortion(data.kcal, weight);
      let portionP = calcPortion(data.protein, weight);
      let portionF = calcPortion(data.fats, weight);
      let portionC = calcPortion(data.carbs, weight);

      totalDailyKcal += portionKcal;
      totalDailyProteins += portionP;
      totalDailyFats += portionF;
      totalDailyCarbs += portionC;

      // Создаем объект продукта со всеми данными прямо ЗДЕСЬ (в области видимости клика)
      const productItem = {
        id: Date.now(), // Уникальный ID на базе времени клика
        title: title,
        weight: weight,
        kcal: portionKcal,
        p: portionP,
        f: portionF,
        c: portionC,
      };

      // Пушим продукт в массив
      addedProducts.push(productItem);

      // Отрисовываем элемент на экране
      createDailyItemDOM(productItem);

      // Визуальный эффект кнопки
      const oldBtnText = addBtn.textContent;
      addBtn.textContent = "Добавлено!";
      addBtn.style.backgroundColor = "#ffd106";

      setTimeout(() => {
        addBtn.textContent = oldBtnText;
        addBtn.style.backgroundColor = "";
      }, 1500);

      updateTotalDisplay();
      saveData();
    });
  }
});

// Кнопка очистки
document.querySelector("#clear-all-btn")?.addEventListener("click", () => {
  totalDailyKcal = 0;
  totalDailyProteins = 0;
  totalDailyFats = 0;
  totalDailyCarbs = 0;
  addedProducts = []; // Очищаем массив

  const list = document.querySelector("#daily-list");
  if (list) list.innerHTML = "";

  updateTotalDisplay();
  saveData();
});

// Загрузка данных при старте страницы
window.addEventListener("load", () => {
  const savedData = localStorage.getItem("dailyStats");

  if (savedData) {
    const parsedData = JSON.parse(savedData);
    totalDailyKcal = parsedData.kcal || 0;
    totalDailyProteins = parsedData.p || 0;
    totalDailyFats = parsedData.f || 0;
    totalDailyCarbs = parsedData.c || 0;

    // Восстанавливаем массив продуктов (если сохраненного массива нет, берем пустой через ??)
    addedProducts = parsedData.products ?? [];

    updateTotalDisplay();

    // Перебираем массив сохраненных продуктов и заново выводим их в HTML дневника питания
    addedProducts.forEach((product) => {
      createDailyItemDOM(product);
    });
  }
});
