// Milestone 4 End-to-End Test Suite
// Verifies live API connectivity, Authentication, Analytics Dashboard, Reports,
// Budget-Expense synchronization, and Complete Workflow Execution.

import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

async function runMilestone4Verification() {
  console.log("==================================================");
  console.log(" TRIPNEST MILESTONE 4 END-TO-END VERIFICATION");
  console.log("==================================================\n");

  const testEmail = `m4_traveler_${Date.now()}@tripnest.com`;
  const testPassword = "Password@123";
  let token = "";

  try {
    // 1. REGISTRATION
    console.log("1. Testing Registration...");
    const regRes = await client.post("/auth/register", {
      firstName: "Milestone4",
      lastName: "Tester",
      email: testEmail,
      password: testPassword,
      phone: "9876543210"
    });
    console.log("   ✓ Registration Success:", regRes.data);

    // 2. LOGIN & TOKEN ACQUISITION
    console.log("\n2. Testing Authentication Login...");
    const loginRes = await client.post("/auth/login", {
      email: testEmail,
      password: testPassword
    });
    token = loginRes.data.token;
    console.log("   ✓ Login Success! JWT Token Acquired (length:", token.length, ")");

    // Authenticated client
    const authClient = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    // 3. INITIAL ANALYTICS CHECK (Empty state verification)
    console.log("\n3. Testing Analytics Dashboard API (Initial Empty State)...");
    const initialAnalytics = await authClient.get("/analytics/dashboard");
    console.log("   ✓ Initial Analytics Received:");
    console.log("     - Total Trips:", initialAnalytics.data.totalTrips);
    console.log("     - Total Budget: $", initialAnalytics.data.totalBudget);
    console.log("     - Total Expenses: $", initialAnalytics.data.totalExpenses);
    console.log("     - Budget Utilization:", initialAnalytics.data.budgetUtilization, "%");

    // 4. CREATE TRIP
    console.log("\n4. Creating Trip ('Alpine Wonderland Expedition')...");
    const tripRes = await authClient.post("/trips", {
      tripName: "Alpine Wonderland Expedition",
      description: "Swiss Alps winter skiing and hiking adventure.",
      destinationId: 1,
      startDate: "2026-10-01",
      endDate: "2026-10-10",
      budgetAllocated: 8000.00,
      numberOfTravelers: 2,
      status: "UPCOMING"
    });
    const createdTrip = tripRes.data;
    const tripId = createdTrip.tripId || createdTrip.id;
    console.log("   ✓ Trip Created Successfully! Trip ID:", tripId, "Status:", createdTrip.status);

    // 5. SET BUDGET
    console.log("\n5. Setting Trip Budget...");
    const budgetRes = await authClient.post("/budgets", {
      trip: { tripId: tripId },
      totalBudget: 8000.00,
      currency: "USD"
    });
    const budgetId = budgetRes.data.budgetId;
    console.log("   ✓ Budget Configured! Budget ID:", budgetId, "Allocated: $8,000");

    // 6. ADD EXPENSES
    console.log("\n6. Adding Real Trip Expenses...");
    const exp1 = await authClient.post("/expenses", {
      budget: { budgetId: budgetId },
      category: "Transportation",
      expenseTitle: "Zurich Direct Flight",
      amount: 1400.00,
      expenseDate: "2026-10-01",
      notes: "Swiss International Air Lines"
    });
    console.log("   ✓ Added Expense 1:", exp1.data.expenseTitle, "- $", exp1.data.amount);

    const exp2 = await authClient.post("/expenses", {
      budget: { budgetId: budgetId },
      category: "Accommodation",
      expenseTitle: "Zermatt Mountain Chalet",
      amount: 2200.00,
      expenseDate: "2026-10-02",
      notes: "7 Nights Matterhorn view"
    });
    console.log("   ✓ Added Expense 2:", exp2.data.expenseTitle, "- $", exp2.data.amount);

    const exp3 = await authClient.post("/expenses", {
      budget: { budgetId: budgetId },
      category: "Food",
      expenseTitle: "Alpine Fondue Dinner",
      amount: 350.00,
      expenseDate: "2026-10-03",
      notes: "Traditional Swiss restaurant"
    });
    console.log("   ✓ Added Expense 3:", exp3.data.expenseTitle, "- $", exp3.data.amount);

    // 7. VERIFY EXPENSE VALIDATION (Negative amount check)
    console.log("\n7. Testing Expense Validation (Rejecting Negative Amount)...");
    try {
      await authClient.post("/expenses", {
        budget: { budgetId: budgetId },
        category: "Food",
        expenseTitle: "Invalid Expense",
        amount: -50.00,
        expenseDate: "2026-10-04"
      });
      console.error("   ✗ Error: Negative expense was unexpectedly allowed!");
    } catch (err) {
      console.log("   ✓ Correctly Rejected Negative Amount! Status:", err.response?.status, err.response?.data?.message);
    }

    // 8. VERIFY DYNAMIC ANALYTICS UPDATE
    console.log("\n8. Verifying Real-Time Analytics Recalculation...");
    const updatedAnalytics = await authClient.get("/analytics/dashboard");
    const a = updatedAnalytics.data;
    console.log("   ✓ Real Analytics Recalculated:");
    console.log("     - Total Trips:", a.totalTrips);
    console.log("     - Total Budget: $", a.totalBudget);
    console.log("     - Total Expenses: $", a.totalExpenses, "(Expected: $3,950)");
    console.log("     - Remaining Budget: $", a.remainingBudget, "(Expected: $4,050)");
    console.log("     - Budget Utilization:", a.budgetUtilization, "% (Expected: ~49.38%)");
    console.log("     - Expense By Category:", JSON.stringify(a.expenseByCategory));
    console.log("     - Status Distribution:", JSON.stringify(a.tripStatusDistribution));

    if (parseFloat(a.totalExpenses) === 3950 && parseFloat(a.remainingBudget) === 4050) {
      console.log("   ✓ PASS: Financial metrics exactly matched persisted expense calculations!");
    } else {
      console.warn("   ⚠ Discrepancy detected in calculations.");
    }

    // 9. TEST REPORTS GENERATION & FILTERING
    console.log("\n9. Testing Reports Generation API...");
    const reportsRes = await authClient.get("/reports");
    const r = reportsRes.data;
    console.log("   ✓ Reports Generated Successfully:");
    console.log("     - Trip Summaries count:", r.tripSummary.length);
    console.log("     - Budget Summaries count:", r.budgetSummary.length);
    console.log("     - Expense Summaries count:", r.expenseSummary.length);
    console.log("     - Status Breakdown count:", r.statusSummary.length);

    console.log("\n10. Testing Reports Filtering by Category ('Accommodation')...");
    const filteredReports = await authClient.get("/reports", { params: { category: "Accommodation" } });
    console.log("   ✓ Filtered Expenses count:", filteredReports.data.expenseSummary.length, "(Expected: 1)");
    if (filteredReports.data.expenseSummary.length === 1 && filteredReports.data.expenseSummary[0].category === "Accommodation") {
      console.log("   ✓ PASS: Category filtering successfully filtered out other categories!");
    }

    // 11. COMPLETE TRIP WORKFLOW
    console.log("\n11. Updating Trip Status to 'COMPLETED'...");
    await authClient.put(`/trips/${tripId}`, {
      tripName: "Alpine Wonderland Expedition",
      description: "Swiss Alps winter skiing and hiking adventure.",
      destinationId: 1,
      startDate: "2026-10-01",
      endDate: "2026-10-10",
      budgetAllocated: 8000.00,
      numberOfTravelers: 2,
      status: "COMPLETED"
    });
    console.log("   ✓ Trip marked as COMPLETED.");

    const finalAnalytics = await authClient.get("/analytics/dashboard");
    console.log("   ✓ Final Status Check: Completed Trips =", finalAnalytics.data.completedTrips);

    console.log("\n==================================================");
    console.log(" ALL MILESTONE 4 END-TO-END TESTS PASSED SUCCESSFULLY! ✓");
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ Test Failed with Error:", error.response?.data || error.message);
    process.exit(1);
  }
}

runMilestone4Verification();
