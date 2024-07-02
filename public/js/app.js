document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/server-worker.js")
      .then(() => console.log("Service Worker Registered"))
      .catch((error) =>
        console.error("Service Worker Registration Failed:", error)
      );
  }
});

const expensesArray = [];

const getUsdBrlValue = async () => {
  const values = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
  const response = await values.json();
  return parseFloat(response.rates.BRL);
};

const submitExpense = async (ev) => {
  ev.preventDefault();

  let expenseId = document.getElementById("expenseId").textContent;
  let description = document.getElementById("description").value;
  let quantity = document.getElementById("quantity").value;
  let value = document.getElementById("value").value;
  let currency1 = document.getElementById("currency1").value;
  let currency2 = document.getElementById("currency2").value;

  const usdValue = await getUsdBrlValue();

  const amount = parseInt(value) * parseInt(quantity) * usdValue;

  const expenseItem = {
    expenseId,
    description,
    quantity,
    value,
    currency1,
    currency2,
    amount,
  };

  const index = expensesArray.findIndex(
    (expense) => expense.expenseId == expenseId
  );

  if (index > -1) {
    expensesArray[index] = expenseItem;
  } else {
    expensesArray.push({
      expenseId: Date.now(),
      description,
      quantity,
      value,
      currency1,
      currency2,
      amount,
    });
  }

  document.getElementById("expenseId").textContent = null
  document.getElementById("description").value = null
  document.getElementById("quantity").value = null
  document.getElementById("value").value = null

  handleCalculateExpensesList();
  handleCalculateTotal();
};

const handleCalculateExpensesList = () => {
  const expenses = document.querySelector(".expenses");
  expenses.innerHTML =  ''

  expensesArray.forEach((expenseValues) => {
    const {
      expenseId,
      description,
      quantity,
      value,
      currency1,
      currency2,
      amount,
    } = expenseValues;
    const expense = `${description} (Qtd: ${quantity}): ${value} ${currency1} => ${amount} ${currency2}`;

    const expenseItem = document.createElement("div");
    expenseItem.className = "expense-item";
    expenseItem.id = description;
    expenseItem.innerHTML = `
    <span>${expense}</span>
  
    <div class="buttons"> 
      <button type="button" class="btn btn-info fa fa-pencil" onclick="handleEdit(${expenseId})"></button>
      <button type="button" class="btn btn-danger fa fa-trash" onclick="handleDelete(${expenseId})"></button>
    </div>
    `;

    expenses.appendChild(expenseItem);
  });
};

const handleEdit = (expenseId) => {
  const expenseItem = expensesArray.find((el) => el.expenseId === expenseId);

  document.getElementById("expenseId").textContent = expenseId;
  document.getElementById("description").value = expenseItem.description;
  document.getElementById("quantity").value = expenseItem.quantity;
  document.getElementById("value").value = expenseItem.value;
  document.getElementById("currency1").value = expenseItem.currency1;
  document.getElementById("currency2").value = expenseItem.currency2;
};

const handleDelete = (expenseId) => {
  const expenseItemIndex = expensesArray.findIndex(
    (el) => el.expenseId == expenseId
  );

  expensesArray.splice(expenseItemIndex, 1);

  handleCalculateExpensesList();
  handleCalculateTotal();
};

const handleCalculateTotal = () => {
  const origin = document.querySelector(".total-origin");
  const destination = document.querySelector(".total-destination");

  origin.innerHTML = "";
  destination.innerHTML = "";

  const totalOrigin = expensesArray.reduce((acc, item) => {
    return acc + parseFloat(item.value);
  }, 0);

  const totalDestination = expensesArray.reduce((acc, item) => {
    return acc + parseFloat(item.amount);
  }, 0);

  const originText = document.createTextNode(
    `Total (Moeda de Origem): USD ${totalOrigin}`
  );
  const destinationText = document.createTextNode(
    `Total (Moeda de Destino): R$ ${totalDestination}`
  );

  origin.appendChild(originText);
  destination.appendChild(destinationText);
};
