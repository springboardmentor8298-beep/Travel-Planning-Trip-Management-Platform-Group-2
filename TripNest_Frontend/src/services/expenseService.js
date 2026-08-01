import API from "./api";

export const createExpense = (budgetId, expense) => {
    return API.post(`/budgets/${budgetId}/expenses`, expense);
};

export const deleteExpense = (expenseId) => {
    return API.delete(`/budgets/expenses/${expenseId}`);
};

export const getExpensesAnalytics = (budgetId) => {
    return API.get(`/budgets/${budgetId}/expenses/analytics`);
};
