function ExpenseCard({

    expense,

    onEdit,

    onDelete

})  {

    return (

        <div className="expense-card">

            <div className="expense-top">

                <h3>{expense.title}</h3>

                <h2>₹{expense.amount}</h2>

            </div>


               <p>

                    <span className={`category-badge ${expense.category.toLowerCase()}`}>

                        {expense.category}

                    </span>

                </p>


            <p>

                <strong>Date :</strong>

                {new Date(expense.expenseDate).toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )}

            </p>

            <p>{expense.notes}</p>

            <div className="expense-actions">

    <button
        className="edit-btn"
        onClick={() => onEdit(expense)}
    >
        ✏ Edit
    </button>

    <button
        className="delete-btn"
        onClick={() => onDelete(expense.id)}
    >
        🗑 Delete
    </button>

</div>

        </div>

        

    );

}

export default ExpenseCard;