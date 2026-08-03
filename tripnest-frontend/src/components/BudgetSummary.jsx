function BudgetSummary({

    budget,

    totalSpent,

    remainingBudget,

    budgetPercentage

}) {

    return (

        <>

            <div className="budget-summary">

                <div className="budget-card">

                    <h3>💰 Total Budget</h3>

                    <h2>₹{budget.toLocaleString()}</h2>

                </div>

                <div className="budget-card">

                    <h3>💸 Total Spent</h3>

                    <h2>₹{totalSpent.toLocaleString()}</h2>

                </div>

                <div className="budget-card">

                    <h3>💵 Remaining</h3>

                    <h2
                        style={{
                            color: remainingBudget < 0
                                ? "#ef4444"
                                : "#2563eb"
                        }}
                    >

                        {remainingBudget < 0
            ? `-₹${Math.abs(remainingBudget).toLocaleString()}`
            : `₹${remainingBudget.toLocaleString()}`}

                    </h2>

                    

                </div>

            </div>

            <div className="budget-progress">

                <div className="progress-header">

                    <span>Budget Used</span>

                    <span>{budgetPercentage.toFixed(1)}%</span>

                </div>

                <div className="progress-bar">

                    <div
                        className={`progress-fill ${
                            budgetPercentage > 100
                                ? "danger"
                                : ""
                        }`}
                        style={{
                            width: `${Math.min(budgetPercentage,100)}%`
                        }}
                    ></div>

                </div>

                {remainingBudget < 0 && (

                    <div className="budget-warning">

                        ⚠️ You have exceeded your trip budget!

                    </div>

                )}

            </div>

        </>

    );

}

export default BudgetSummary;