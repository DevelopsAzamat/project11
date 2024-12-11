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
  const cont = document.querySelector("#containermain");
  cont.classList.toggle("hidden")
}

function toggleNews() {
  const news = document.getElementById('news');
  news.classList.toggle('hidden'); // Переключаем класс hidden
}

function toggleContacts() {
  const contacts = document.getElementById('contacts');
  contacts.classList.toggle('hidden'); // Переключаем класс hidden
}
function toggleAboutbank(){
  const middle = document.getElementById('middle');
  middle.classList.toggle('hidden'); // Переключаем класс hidden
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
  const amount = parseFloat(document.getElementById("amount").value);
  const interestRate = parseFloat(document.getElementById("interestRate").value);
  const termYears = parseInt(document.getElementById("termYears").value);

  if (isNaN(amount) || isNaN(interestRate) || isNaN(termYears)) {
    document.getElementById('error').innerHTML = "Пожалуйста, заполните все поля!";
    return;
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
function submitLoanApplication() {
  const fullName = document.getElementById('fullName').value;
  const birthDate = document.getElementById('birthDate').value;
  const address = document.getElementById('address').value;
  const serialpass = document.getElementById('serialpass').value;
  const passnum = document.getElementById('passnum').value;
  const pinflnum = document.getElementById('pinflnum').value;
  const phone = document.getElementById('phone').value;
  const clientType = document.getElementById('clientType').value;
  const loanSum = parseFloat(document.getElementById('loanSum').value);

  const loanData = {
      fullName,
      birthDate,
      address,
      serialpass,
      passnum,
      pinflnum,
      phone,
      clientType,
      loanSum
  };


  // Проверка возраста
  const [year, month, day] = birthDate.split('-').map(Number); 
  const today = new Date();
  const birthDateObj = new Date(year, month - 1, day);
  const age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  const dayDiff = today.getDate() - birthDateObj.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
  }

  if (age < 20) {
      alert('Вы должны быть старше 20 лет для подачи заявки.');
      return;
  }

  // Максимальная сумма в зависимости от типа клиента
  let maxAmount = 0;
  let rate = 0;

  switch (clientType) {
      case 'student':
          maxAmount = 100000000; // 100 млн сум
          rate = 13; // Ставка для студентов
          break;
      case 'physclient':
          maxAmount = 500000000; // 500 млн сум
          rate = 22; // Ставка для физических лиц
          break;
      case 'lawclient':
          maxAmount = 1000000000; // 1 млрд сум
          rate = 19; // Ставка для юридических лиц
          break;
  }

  // Проверка на максимальную сумму
  if (loanSum > maxAmount) {
      alert(`Максимальная сумма для выбранной категории: ${maxAmount} сум.`);
      return;
  }

  // Если все проверки пройдены, показываем успешную отправку заявки
  alert(`Заявка принята!\nСтавка: ${rate}%\nСумма кредита: ${loanSum} сум.`);

  // Закрываем форму
  closeLoanForm();

  // Заполняем калькулятор с данными из заявки
  document.getElementById('loanAmount').value = loanSum;
  document.getElementById('loanTerm').value = 1; // По умолчанию 1 лет
  document.getElementById('interestRate').value = rate;

  // Выполняем расчет
  calculateLoan();
}
