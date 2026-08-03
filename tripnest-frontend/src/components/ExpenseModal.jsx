function ExpenseModal({

    showExpenseForm,

    setShowExpenseForm,

    expenseForm,

    handleExpenseChange,

    handleExpenseSubmit,

    editingExpense,

    setEditingExpense

}) {

    if (!showExpenseForm) {

        return null;

    }

    return (

        <div className="expense-modal-overlay">

            <div className="expense-modal">

                <h2>

                    {editingExpense ? "✏ Edit Expense" : "💰 Add Expense"}

                </h2>

                <form onSubmit={handleExpenseSubmit}>

                    <div className="form-group">

                        <label>Expense Title</label>

                        <input
                            type="text"
                            name="title"
                            value={expenseForm.title}
                            onChange={handleExpenseChange}
                        />

                    </div>

                    <div className="form-row">

                        <div className="form-group">

                            <label>Amount</label>

                            <input
                                type="number"
                                name="amount"
                                value={expenseForm.amount}
                                onChange={handleExpenseChange}
                            />

                        </div>

                        <div className="form-group">

                            <label>Category</label>

                            <select
                                name="category"
                                value={expenseForm.category}
                                onChange={handleExpenseChange}
                            >

                                <option value="FOOD">🍔 Food</option>
                                <option value="HOTEL">🏨 Hotel</option>
                                <option value="TRANSPORT">🚕 Transport</option>
                                <option value="SHOPPING">🛍 Shopping</option>
                                <option value="OTHER">📦 Other</option>

                            </select>

                        </div>

                    </div>

                    <div className="form-group">

                        <label>Expense Date</label>

                        <input
                            type="date"
                            name="expenseDate"
                            value={expenseForm.expenseDate}
                            onChange={handleExpenseChange}
                        />

                    </div>

                    <div className="form-group">

                        <label>Notes</label>

                        <textarea
                            name="notes"
                            value={expenseForm.notes}
                            onChange={handleExpenseChange}
                        />

                    </div>

                    <div className="modal-buttons">

                        <button
                            type="button"
                           onClick={() => {

                                setShowExpenseForm(false);

                                if (editingExpense) {

                                    setEditingExpense(null);

                                }

                            }}
                        >
                            Cancel
                        </button>

                        <button type="submit">

                            Save Expense

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default ExpenseModal;