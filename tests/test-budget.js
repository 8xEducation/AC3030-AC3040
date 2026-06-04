const { database } = require('./src/database');
const BudgetController = require('./src/controllers/BudgetController').BudgetController;

async function test() {
  const res = await BudgetController.createBudget({
    name: "Test Budget",
    amountInCents: 10000,
    timeframe: "MONTHLY",
    anchorDay: 1,
    categoryId: undefined
  });
  console.log("Create Budget Result:", res);
}

test().catch(console.error);
