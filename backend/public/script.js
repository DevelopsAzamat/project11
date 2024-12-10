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
        <p>Сумма кредита: ${result.amount} сумм.</p>
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
  const introText = document.getElementById('intro-text');
  const calculator = document.getElementById('calculator');

  // Скрыть текст и показать калькулятор
  introText.classList.add('hidden');
  calculator.classList.remove('hidden');
}

function toggleNews() {
  const news = document.getElementById('news');
  news.classList.toggle('hidden'); // Переключаем класс hidden
}

function toggleContacts() {
  const contacts = document.getElementById('contacts');
  contacts.classList.toggle('hidden'); // Переключаем класс hidden
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

  // Подготовим таблицу аннуитетного графика платежей
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

  // Покажем таблицу
  document.getElementById('annuity-result').getElementsByTagName('tbody')[0].innerHTML = annuityTable;
  document.getElementById('annuity-table').classList.remove('hidden');

  // Рассчитаем дифференцированный платеж
  let differentiatedTable = "";
  remainingDebt = amount;
  const differentiatedPayments = [];

  for (let month = 1; month <= termMonths; month++) {
    const principalPayment = amount / termMonths;
    const interestPayment = remainingDebt * monthlyRate;
    const totalPayment = principalPayment + interestPayment;
    remainingDebt -= principalPayment;

    differentiatedPayments.push({
      month,
      principalPayment,
      interestPayment,
      totalPayment,
      remainingDebt
    });
  }

  // Заполняем таблицу дифференцированного графика
  let diffTableContent = "";
  differentiatedPayments.forEach((payment) => {
    diffTableContent += `
      <tr>
        <td>${payment.month}</td>
        <td>${payment.totalPayment.toFixed(2)}</td>
        <td>${payment.interestPayment.toFixed(2)}</td>
        <td>${payment.principalPayment.toFixed(2)}</td>
        <td>${payment.remainingDebt.toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById('differentiated-result').getElementsByTagName('tbody')[0].innerHTML = diffTableContent;
  document.getElementById('differentiated-table').classList.remove('hidden');

  // Показываем блок выбора графика
  document.getElementById('payment-graph').classList.remove('hidden');
}