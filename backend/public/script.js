const form = document.getElementById("loan-form");
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the page from reloading on form submit

  const fio = document.getElementById("fio").value;
  const amount = document.getElementById("amount").value;
  if (amount > 100000000) {
    errorDiv.innerHTML = "Сумма кредита не может превышать 100 000 000.";
    resultDiv.innerHTML = ''; // Clear results
    return; // Exit the function if the condition is not met
  }
  const interestRate = document.getElementById("interestRate").value;
  const termYears = document.getElementById("termYears").value;

  const data = { fio, amount, interestRate, termYears };

  try {
    const response = await fetch("http://localhost:5000/api/add-credit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) { // Checking for a successful response
      resultDiv.innerHTML = `
        <h3>Результаты:</h3>
        <p>ФИО: ${result.fio}</p>
        <p>Сумма кредита: ${result.amount} сум.</p>
        <p>Процентная ставка: ${result.interest_rate}%</p>
        <p>Срок: ${result.term_years} лет</p>
      `;
      errorDiv.innerHTML = ''; // Clear errors
    } else {
      errorDiv.innerHTML = result.error || "Неизвестная ошибка";
      resultDiv.innerHTML = ''; // Clear results
    }
  } catch (err) {
    errorDiv.innerHTML = "Ошибка при отправке данных";
    resultDiv.innerHTML = ''; // Clear results
  }
});

function toggleCalculator() {
  hideAllTabs(); // Скрываем все вкладки
  const cont = document.querySelector("#containermain");
  cont.classList.toggle("hidden"); // Показываем или скрываем вкладку калькулятора
}

function toggleNews() {
  hideAllTabs(); // Скрываем все вкладки
  const news = document.getElementById('news');
  news.classList.toggle('hidden'); // Показываем или скрываем вкладку новостей
}

function toggleContacts() {
  hideAllTabs(); // Скрываем все вкладки
  const contacts = document.getElementById('contacts');
  contacts.classList.toggle('hidden'); // Показываем или скрываем вкладку контактов
}

function toggleAboutBank() {
  hideAllTabs(); // Скрываем все вкладки
  const middle = document.getElementById('middle');
  middle.classList.toggle('hidden'); // Показываем или скрываем вкладку о банке
}

// Скрывает все вкладки
function hideAllTabs() {
  const tabs = ['#containermain', '#news', '#contacts', '#middle'];
  tabs.forEach(tab => {
    const element = document.querySelector(tab);
    if (element) {
      element.classList.add('hidden'); // Добавляем класс hidden
    }
  });
}

function reloadPage() {
  location.reload(); // Перезагружает текущую страницу
}

function clearForm() {
  document.getElementById('loan-form').reset();
  document.getElementById('result').innerHTML = '';
  document.getElementById('error').innerHTML = '';
  document.getElementById('payment-graph').classList.add('hidden');
  document.getElementById('annuity-table').classList.add('hidden');
  document.getElementById('differentiated-table').classList.add('hidden');
}

function calculate() {
  const rawAmount = document.getElementById("amount").value;
  const amount = parseFloat(rawAmount.replace(/\s+/g, '')); // Убираем пробелы
  const interestRate = parseFloat(document.getElementById("interestRate").value);
  const termYears = parseInt(document.getElementById("termYears").value);

  if (isNaN(amount) || isNaN(interestRate) || isNaN(termYears)) {
    document.getElementById('error').innerHTML = "Пожалуйста, заполните все поля!";
    return;
  }

  function formatNumber(input) {
    // Убираем все пробелы и некорректные символы
    const value = input.value.replace(/\s+/g, '').replace(/[^\d]/g, '');

    // Форматируем число с пробелами
    const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    // Обновляем значение поля
    input.value = formattedValue;
  }
  const monthlyRate = (interestRate / 100) / 12;
  const termMonths = termYears * 12;

  // Рассчитаем аннуитетный платеж
  const annuityPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

  let annuityTable = "";
  let remainingDebt = amount;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = remainingDebt * monthlyRate;
    const principalPayment = annuityPayment - interestPayment;
    remainingDebt -= principalPayment;

    annuityTable += `
      <tr>
        <td>${month}</td>
        <td>${annuityPayment.toFixed(2)}</td>
        <td>${interestPayment.toFixed(2)}</td>
        <td>${principalPayment.toFixed(2)}</td>
        <td>${remainingDebt.toFixed(2)}</td>
      </tr>
    `;
  }

  document.getElementById('annuity-result').getElementsByTagName('tbody')[0].innerHTML = annuityTable;

  // Рассчитаем дифференцированный платеж
  let differentiatedTable = "";
  remainingDebt = amount;

  for (let month = 1; month <= termMonths; month++) {
    const principalPayment = amount / termMonths;
    const interestPayment = remainingDebt * monthlyRate;
    const totalPayment = principalPayment + interestPayment;
    remainingDebt -= principalPayment;

    differentiatedTable += `
      <tr>
        <td>${month}</td>
        <td>${totalPayment.toFixed(2)}</td>
        <td>${interestPayment.toFixed(2)}</td>
        <td>${principalPayment.toFixed(2)}</td>
        <td>${remainingDebt.toFixed(2)}</td>
      </tr>
    `;
  }

  document.getElementById('differentiated-result').getElementsByTagName('tbody')[0].innerHTML = differentiatedTable;

  // Показываем блок выбора графика
  document.getElementById('payment-graph').classList.remove('hidden');
  toggleGraph(); // Обновляем отображение выбранной таблицы
}

function toggleGraph() {
  const paymentType = document.getElementById("payment-type").value;

  // Скрываем обе таблицы сначала
  document.getElementById('annuity-table').classList.add('hidden');
  document.getElementById('differentiated-table').classList.add('hidden');

  // Показываем выбранную таблицу
  if (paymentType === "annuity") {
    document.getElementById('annuity-table').classList.remove('hidden');
  } else if (paymentType === "differentiated") {
    document.getElementById('differentiated-table').classList.remove('hidden');
  }
}

function clearForm() {
  document.getElementById("loan-form").reset();
  document.getElementById('annuity-result').getElementsByTagName('tbody')[0].innerHTML = "";
  document.getElementById('differentiated-result').getElementsByTagName('tbody')[0].innerHTML = "";
  document.getElementById('payment-graph').classList.add('hidden');
  document.getElementById('error').innerHTML = "";
}

document.getElementById('exportBtn').addEventListener('click', function() {
  const annuityTable = document.getElementById('annuity-result'); // Таблица для аннуитетного графика
  const differentiatedTable = document.getElementById('differentiated-result'); // Таблица для дифференцированного графика
  
  // Убедитесь, что таблицы отображаются (если они скрыты, покажите их перед экспортом)
  document.getElementById('differentiated-table').classList.remove('hidden'); // Убираем класс hidden

  // Создание книги Excel
  const wb = XLSX.utils.book_new();

  // Добавление аннуитетной таблицы в книгу Excel
  if (annuityTable) {
      const annuitySheet = XLSX.utils.table_to_sheet(annuityTable);
      XLSX.utils.book_append_sheet(wb, annuitySheet, "Аннуитетный график");
  }

  // Добавление дифференцированной таблицы в книгу Excel
  if (differentiatedTable) {
      const differentiatedSheet = XLSX.utils.table_to_sheet(differentiatedTable);
      XLSX.utils.book_append_sheet(wb, differentiatedSheet, "Дифференцированный график");
  }

  // Скачивание файла Excel
  XLSX.writeFile(wb, 'graphs.xlsx');
});


function openBankInfo() {
  document.getElementById('bankModal').style.display = 'block';
}

function closeBankInfo() {
  document.getElementById('bankModal').style.display = 'none';
}

// Функция для открытия модального окна
function openLoanForm() {
  const modalContent = document.querySelector('.modal-content');
  modalContent.classList.remove('hidden'); // Убираем скрытие
  document.getElementById('loanModal').style.display = 'block';
}

function closeLoanForm() {
  const modalContent = document.querySelector('.modal-content');
  modalContent.classList.add('hidden'); // Добавляем скрытие
  document.getElementById('loanModal').style.display = 'none';
}


// Функция для отправки заявки
// Функция для открытия модального окна
function openLoanForm() {
  document.getElementById('loanModal').style.display = 'block';
}

// Функция для закрытия модального окна
function closeLoanForm() {
  document.getElementById('loanModal').style.display = 'none';
}

// Функция для отправки заявки на кредит
function submitLoanApplication() {
  // Сбор данных формы
  const fullName = document.getElementById('fullName').value.trim();
  const birthDate = document.getElementById('birthDate').value.trim();
  const address = document.getElementById('address').value.trim();
  const serialpass = document.getElementById('serialpass').value.trim();
  const passnum = document.getElementById('passnum').value.trim();
  const pinflnum = document.getElementById('pinflnum').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const clientType = document.getElementById('clientType').value.trim();
  const loanSum = parseFloat(document.getElementById('loanSum').value.trim());

  // Проверка на корректность данных
  if (!fullName || !birthDate || !address || !serialpass || !passnum || !pinflnum || !phone || !email || !clientType || isNaN(loanSum) || loanSum <= 0) {
    alert("Пожалуйста, заполните все поля корректно.");
    return;
  }

  // Данные для отправки на сервер
  const loanData = {
    fullName,
    birthDate,
    address,
    serialpass,
    passnum,
    pinflnum,
    phone,
    email,
    clientType,
    loanSum
  };

  // Отправка данных на сервер
  fetch("http://localhost:5000/api/submit-loan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loanData)
  })
  .then(response => response.json())
  .then(result => {
    if (result.error) {
      alert("Ошибка при отправке заявки: " + result.error);
    } else {
      const rate = result.rate || 'неизвестно';
      alert(`Заявка принята!\nСтавка: ${rate}%\nСумма кредита: ${loanSum} сум.`);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Произошла ошибка при отправке заявки.');
  });

  // Закрытие формы после отправки
  closeLoanForm();
}

// Открытие формы при необходимости
document.getElementById('openLoanFormButton').addEventListener('click', openLoanForm);  // Если есть кнопка для открытия формы


