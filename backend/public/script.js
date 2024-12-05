const form = document.getElementById("loan-form");
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // предотвращает перезагрузку страницы при отправке формы

  const fio = document.getElementById("fio").value;
  const amount = document.getElementById("amount").value;
  const interestRate = document.getElementById("interestRate").value;
  const termYears = document.getElementById("termYears").value;

  const data = { fio, amount, interestRate, termYears };

  try {
    // Отправка данных на сервер
    const response = await fetch("http://localhost:5000/add-credit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // Преобразуем данные в формат JSON
    });

    const result = await response.json();

    // Обработка ответа от сервера
    if (response.status === 201) {
      resultDiv.innerHTML = `
        <h3>Результаты:</h3>
        <p>ФИО: ${result.fio}</p>
        <p>Сумма кредита: ${result.amount} руб.</p>
        <p>Процентная ставка: ${result.interestRate}%</p>
        <p>Срок: ${result.termYears} лет</p>
      `;
      errorDiv.innerHTML = ''; // очищаем ошибки
    } else {
      errorDiv.innerHTML = result.error;
      resultDiv.innerHTML = ''; // очищаем результаты
    }
  } catch (err) {
    errorDiv.innerHTML = "Ошибка при отправке данных";
  }
});
