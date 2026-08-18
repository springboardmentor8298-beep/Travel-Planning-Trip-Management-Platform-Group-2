import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Expense analytics
  const [expenseAnalytics, setExpenseAnalytics] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        profileRes,
        tripsRes,
        analyticsRes
      ] = await Promise.all([
        api.get("/user/profile"),
        api.get("/trips"),
        api.get("/dashboard/analytics")
      ]);

      const profileData = profileRes.data;
      const tripsData = tripsRes.data;
      const analyticsData = analyticsRes.data;

      setProfile(profileData);
      setTrips(tripsData);
      setAnalytics(analyticsData);

      // ==========================================
      // FETCH EXPENSE ANALYTICS FOR ALL TRIPS
      // ==========================================

      let combinedExpenseAnalytics = {
        totalBudget: 0,
        totalSpent: 0,
        remainingBudget: 0,
        totalExpenses: 0,
        categoryTotals: {},
        highestSpendingCategory: null,
        highestCategoryAmount: 0
      };

      if (tripsData.length > 0) {

        const expenseResults =
          await Promise.allSettled(
            tripsData.map((trip) =>
              api.get(
                `/trips/${trip.id}/expenses/analytics`
              )
            )
          );

        expenseResults.forEach((result) => {

          if (result.status === "fulfilled") {

            const data = result.value.data;

            combinedExpenseAnalytics.totalBudget +=
              Number(data.totalBudget || 0);

            combinedExpenseAnalytics.totalSpent +=
              Number(data.totalSpent || 0);

            combinedExpenseAnalytics.remainingBudget +=
              Number(data.remainingBudget || 0);

            combinedExpenseAnalytics.totalExpenses +=
              Number(data.totalExpenses || 0);

            // Category totals
            if (data.categoryTotals) {

              Object.entries(
                data.categoryTotals
              ).forEach(
                ([category, amount]) => {

                  combinedExpenseAnalytics
                    .categoryTotals[category] =
                    (
                      combinedExpenseAnalytics
                        .categoryTotals[category] ||
                      0
                    ) + Number(amount || 0);
                }
              );
            }
          }
        });

        // ==========================================
        // BUDGET USED %
        // ==========================================

        if (
          combinedExpenseAnalytics.totalBudget > 0
        ) {
          combinedExpenseAnalytics
            .budgetUsedPercentage =
            (
              combinedExpenseAnalytics.totalSpent /
              combinedExpenseAnalytics.totalBudget
            ) * 100;
        } else {
          combinedExpenseAnalytics
            .budgetUsedPercentage = 0;
        }

        // ==========================================
        // HIGHEST CATEGORY
        // ==========================================

        Object.entries(
          combinedExpenseAnalytics.categoryTotals
        ).forEach(
          ([category, amount]) => {

            if (
              amount >
              combinedExpenseAnalytics
                .highestCategoryAmount
            ) {
              combinedExpenseAnalytics
                .highestCategoryAmount = amount;

              combinedExpenseAnalytics
                .highestSpendingCategory =
                category;
            }
          }
        );
      }

      setExpenseAnalytics(
        combinedExpenseAnalytics
      );

    } catch (err) {

      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Failed to load dashboard data."
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div style={styles.page}>
        <Sidebar />

        <main style={styles.main}>
          <div style={styles.loading}>
            Loading your dashboard...
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div style={styles.page}>
        <Sidebar />

        <main style={styles.main}>
          <div
            className="glass-card"
            style={styles.errorCard}
          >
            <div style={styles.errorIcon}>
              ⚠️
            </div>

            <h2 style={styles.errorTitle}>
              Unable to load dashboard
            </h2>

            <p style={styles.errorText}>
              {error}
            </p>

            <button
              className="btn-aurora"
              onClick={fetchData}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // ANALYTICS VALUES
  // ==========================================

  const totalTrips =
    analytics?.totalTrips || 0;

  const planningTrips =
    analytics?.planningTrips || 0;

  const upcomingTrips =
    analytics?.upcomingTrips || 0;

  const completedTrips =
    analytics?.completedTrips || 0;

  const totalBudget =
    analytics?.totalBudget || 0;

  const averageBudget =
    analytics?.averageBudget || 0;

  // ==========================================
  // EXPENSE ANALYTICS VALUES
  // ==========================================

  const totalSpent =
    expenseAnalytics?.totalSpent || 0;

  const remainingBudget =
    expenseAnalytics?.remainingBudget || 0;

  const totalExpenses =
    expenseAnalytics?.totalExpenses || 0;

  const budgetUsedPercentage =
    expenseAnalytics?.budgetUsedPercentage || 0;

  const highestCategory =
    expenseAnalytics
      ?.highestSpendingCategory;

  const highestCategoryAmount =
    expenseAnalytics
      ?.highestCategoryAmount || 0;

  const categoryTotals =
    expenseAnalytics?.categoryTotals || {};

  // ==========================================
  // STATUS PERCENTAGES
  // ==========================================

  const planningPercentage =
    totalTrips > 0
      ? (planningTrips / totalTrips) * 100
      : 0;

  const upcomingPercentage =
    totalTrips > 0
      ? (upcomingTrips / totalTrips) * 100
      : 0;

  const completedPercentage =
    totalTrips > 0
      ? (completedTrips / totalTrips) * 100
      : 0;

  // ==========================================
  // RECENT TRIPS
  // ==========================================

  const recentTrips = [...trips]
    .sort((a, b) => {
      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    })
    .slice(0, 5);

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {

    switch (status) {

      case "PLANNING":
        return {
          background:
            "rgba(37, 99, 235, 0.15)",
          color: "#60a5fa"
        };

      case "UPCOMING":
        return {
          background:
            "rgba(124, 58, 237, 0.15)",
          color: "#a78bfa"
        };

      case "COMPLETED":
        return {
          background:
            "rgba(16, 185, 129, 0.15)",
          color: "#34d399"
        };

      default:
        return {
          background:
            "rgba(148, 163, 184, 0.15)",
          color: "#94a3b8"
        };
    }
  };

  // ==========================================
  // CATEGORY LABEL
  // ==========================================

  const formatCategory = (category) => {

    if (!category) return "";

    return category
      .toLowerCase()
      .replace("_", " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  // ==========================================
  // CATEGORY ICON
  // ==========================================

  const getCategoryIcon = (category) => {

    switch (category) {

      case "TRANSPORTATION":
        return "🚕";

      case "HOTEL":
        return "🏨";

      case "FOOD":
        return "🍔";

      case "SHOPPING":
        return "🛍️";

      case "ENTERTAINMENT":
        return "🎟️";

      case "MISCELLANEOUS":
        return "📦";

      default:
        return "💰";
    }
  };

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN */}

      <main style={styles.main}>

        {/* HEADER */}

        <div style={styles.header}>

          <div>

            <p style={styles.eyebrow}>
              TRIPNEST DASHBOARD
            </p>

            <h1 style={styles.title}>
              Welcome back,{" "}
              <span className="gradient-text">
                {profile?.firstName ||
                  profile?.username ||
                  "Traveler"}
              </span>{" "}
              👋
            </h1>

            <p style={styles.subtitle}>
              Here's an overview of your
              travel plans and analytics.
            </p>

          </div>

          <button
            className="btn-aurora"
            onClick={() =>
              navigate("/trips/create")
            }
          >
            + Create Trip
          </button>

        </div>

        {/* ====================================
            TOP ANALYTICS CARDS
        ==================================== */}

        <div style={styles.statsGrid}>

          {/* Total Trips */}

          <div
            className="glass-card"
            style={styles.statCard}
          >

            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(124,58,237,0.15)"
              }}
            >
              ✈️
            </div>

            <div>

              <p style={styles.statValue}>
                {totalTrips}
              </p>

              <p style={styles.statLabel}>
                Total Trips
              </p>

            </div>

          </div>

          {/* Upcoming */}

          <div
            className="glass-card"
            style={styles.statCard}
          >

            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(6,182,212,0.15)"
              }}
            >
              🗓️
            </div>

            <div>

              <p style={styles.statValue}>
                {upcomingTrips}
              </p>

              <p style={styles.statLabel}>
                Upcoming Trips
              </p>

            </div>

          </div>

          {/* Total Budget */}

          <div
            className="glass-card"
            style={styles.statCard}
          >

            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(16,185,129,0.15)"
              }}
            >
              💰
            </div>

            <div>

              <p style={styles.statValue}>
                {formatCurrency(
                  totalBudget
                )}
              </p>

              <p style={styles.statLabel}>
                Total Budget
              </p>

            </div>

          </div>

          {/* Total Spent */}

          <div
            className="glass-card"
            style={styles.statCard}
          >

            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(239,68,68,0.15)"
              }}
            >
              💸
            </div>

            <div>

              <p style={styles.statValue}>
                {formatCurrency(
                  totalSpent
                )}
              </p>

              <p style={styles.statLabel}>
                Total Spent
              </p>

            </div>

          </div>

        </div>

        {/* ====================================
            EXPENSE ANALYTICS
        ==================================== */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <h2 style={styles.sectionTitle}>
              💰 Expense Analytics
            </h2>

            <span
              style={styles.expenseCount}
            >
              {totalExpenses} expenses
            </span>

          </div>

          {/* Expense Summary Cards */}

          <div
            style={styles.expenseStatsGrid}
          >

            {/* Total Spent */}

            <div
              className="glass-card"
              style={styles.expenseStatCard}
            >

              <div
                style={{
                  ...styles.expenseIcon,
                  background:
                    "rgba(239,68,68,0.12)"
                }}
              >
                💸
              </div>

              <div>

                <p
                  style={
                    styles.expenseStatValue
                  }
                >
                  {formatCurrency(
                    totalSpent
                  )}
                </p>

                <p
                  style={
                    styles.expenseStatLabel
                  }
                >
                  Total Spent
                </p>

              </div>

            </div>

            {/* Remaining */}

            <div
              className="glass-card"
              style={styles.expenseStatCard}
            >

              <div
                style={{
                  ...styles.expenseIcon,
                  background:
                    "rgba(16,185,129,0.12)"
                }}
              >
                💵
              </div>

              <div>

                <p
                  style={{
                    ...styles.expenseStatValue,
                    color:
                      remainingBudget < 0
                        ? "#f87171"
                        : "#34d399"
                  }}
                >
                  {formatCurrency(
                    remainingBudget
                  )}
                </p>

                <p
                  style={
                    styles.expenseStatLabel
                  }
                >
                  Remaining Budget
                </p>

              </div>

            </div>

            {/* Budget Used */}

            <div
              className="glass-card"
              style={styles.expenseStatCard}
            >

              <div
                style={{
                  ...styles.expenseIcon,
                  background:
                    "rgba(124,58,237,0.12)"
                }}
              >
                📊
              </div>

              <div>

                <p
                  style={
                    styles.expenseStatValue
                  }
                >
                  {budgetUsedPercentage.toFixed(
                    1
                  )}
                  %
                </p>

                <p
                  style={
                    styles.expenseStatLabel
                  }
                >
                  Budget Used
                </p>

              </div>

            </div>

            {/* Highest Category */}

            <div
              className="glass-card"
              style={styles.expenseStatCard}
            >

              <div
                style={{
                  ...styles.expenseIcon,
                  background:
                    "rgba(245,158,11,0.12)"
                }}
              >
                🏆
              </div>

              <div>

                <p
                  style={
                    styles.expenseStatValue
                  }
                >
                  {highestCategory
                    ? formatCategory(
                        highestCategory
                      )
                    : "None"}
                </p>

                <p
                  style={
                    styles.expenseStatLabel
                  }
                >
                  Highest Category
                </p>

              </div>

            </div>

          </div>

          {/* Budget Progress */}

          <div
            className="glass-card"
            style={
              styles.expenseAnalyticsCard
            }
          >

            <div
              style={
                styles.expenseCardHeader
              }
            >

              <h3
                style={
                  styles.analyticsTitle
                }
              >
                📊 Budget Usage
              </h3>

              <strong
                style={{
                  color:
                    budgetUsedPercentage > 100
                      ? "#f87171"
                      : "#a78bfa"
                }}
              >
                {budgetUsedPercentage.toFixed(
                  1
                )}
                %
              </strong>

            </div>

            <div
              style={styles.progressTrack}
            >

              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(
                    budgetUsedPercentage,
                    100
                  )}%`,
                  background:
                    budgetUsedPercentage > 100
                      ? "#ef4444"
                      : "#7c3aed"
                }}
              />

            </div>

            <div
              style={
                styles.budgetLabels
              }
            >

              <span>
                Spent{" "}
                <strong>
                  {formatCurrency(
                    totalSpent
                  )}
                </strong>
              </span>

              <span>
                Budget{" "}
                <strong>
                  {formatCurrency(
                    totalBudget
                  )}
                </strong>
              </span>

            </div>

            {remainingBudget < 0 && (

              <div
                style={
                  styles.warningBox
                }
              >
                ⚠️ You have exceeded your
                total trip budget by{" "}
                <strong>
                  {formatCurrency(
                    Math.abs(
                      remainingBudget
                    )
                  )}
                </strong>
              </div>

            )}

          </div>

          {/* Category + Summary */}

          <div
            style={
              styles.expenseAnalyticsGrid
            }
          >

            {/* Category Breakdown */}

            <div
              className="glass-card"
              style={
                styles.expenseAnalyticsCard
              }
            >

              <h3
                style={
                  styles.analyticsTitle
                }
              >
                🧾 Spending by Category
              </h3>

              {Object.keys(
                categoryTotals
              ).length === 0 ? (

                <p
                  style={
                    styles.noExpenseText
                  }
                >
                  No expenses recorded yet.
                </p>

              ) : (

                <div
                  style={
                    styles.categoryList
                  }
                >

                  {Object.entries(
                    categoryTotals
                  )
                    .filter(
                      ([, amount]) =>
                        Number(amount) > 0
                    )
                    .sort(
                      ([, a], [, b]) =>
                        Number(b) -
                        Number(a)
                    )
                    .map(
                      ([
                        category,
                        amount
                      ]) => {

                        const percentage =
                          totalSpent > 0
                            ? (
                                Number(
                                  amount
                                ) /
                                totalSpent
                              ) *
                              100
                            : 0;

                        return (

                          <div
                            key={category}
                            style={
                              styles.categoryItem
                            }
                          >

                            <div
                              style={
                                styles.categoryHeader
                              }
                            >

                              <span
                                style={
                                  styles.categoryName
                                }
                              >
                                {getCategoryIcon(
                                  category
                                )}{" "}
                                {formatCategory(
                                  category
                                )}
                              </span>

                              <strong>
                                {formatCurrency(
                                  amount
                                )}
                              </strong>

                            </div>

                            <div
                              style={
                                styles.categoryTrack
                              }
                            >

                              <div
                                style={{
                                  ...styles.categoryFill,
                                  width: `${percentage}%`
                                }}
                              />

                            </div>

                            <span
                              style={
                                styles.categoryPercentage
                              }
                            >
                              {percentage.toFixed(
                                1
                              )}
                              %
                            </span>

                          </div>
                        );
                      }
                    )}

                </div>
              )}

            </div>

            {/* Expense Summary */}

            <div
              className="glass-card"
              style={
                styles.expenseAnalyticsCard
              }
            >

              <h3
                style={
                  styles.analyticsTitle
                }
              >
                📋 Expense Summary
              </h3>

              <div
                style={
                  styles.analyticsRow
                }
              >
                <span>
                  Total Expenses
                </span>

                <strong>
                  {totalExpenses}
                </strong>
              </div>

              <div
                style={
                  styles.analyticsRow
                }
              >
                <span>
                  Total Spent
                </span>

                <strong>
                  {formatCurrency(
                    totalSpent
                  )}
                </strong>
              </div>

              <div
                style={
                  styles.analyticsRow
                }
              >
                <span>
                  Remaining Budget
                </span>

                <strong
                  style={{
                    color:
                      remainingBudget < 0
                        ? "#f87171"
                        : "#34d399"
                  }}
                >
                  {formatCurrency(
                    remainingBudget
                  )}
                </strong>
              </div>

              <div
                style={
                  styles.analyticsRow
                }
              >
                <span>
                  Highest Category
                </span>

                <strong>
                  {highestCategory
                    ? formatCategory(
                        highestCategory
                      )
                    : "None"}
                </strong>
              </div>

              <div
                style={
                  styles.analyticsRow
                }
              >
                <span>
                  Highest Category Amount
                </span>

                <strong>
                  {formatCurrency(
                    highestCategoryAmount
                  )}
                </strong>
              </div>

              <button
                className="btn-ghost"
                style={
                  styles.viewExpensesButton
                }
                onClick={() =>
                  navigate("/expenses")
                }
              >
                View Expenses →
              </button>

            </div>

          </div>

        </section>

        {/* ====================================
            TRIP ANALYTICS
        ==================================== */}

        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            📊 Trip Analytics
          </h2>

          <div
            style={styles.analyticsGrid}
          >

            {/* Budget Summary */}

            <div
              className="glass-card"
              style={styles.analyticsCard}
            >

              <h3
                style={styles.analyticsTitle}
              >
                💰 Budget Summary
              </h3>

              <div
                style={styles.analyticsRow}
              >
                <span>
                  Total Budget
                </span>

                <strong>
                  {formatCurrency(
                    totalBudget
                  )}
                </strong>
              </div>

              <div
                style={styles.analyticsRow}
              >
                <span>
                  Average Trip Budget
                </span>

                <strong>
                  {formatCurrency(
                    Math.round(
                      averageBudget
                    )
                  )}
                </strong>
              </div>

              <div
                style={styles.analyticsRow}
              >
                <span>
                  Number of Trips
                </span>

                <strong>
                  {totalTrips}
                </strong>
              </div>

            </div>

            {/* Trip Status */}

            <div
              className="glass-card"
              style={styles.analyticsCard}
            >

              <h3
                style={styles.analyticsTitle}
              >
                ✈️ Trip Status
              </h3>

              <div
                style={styles.statusBar}
              >

                {planningPercentage > 0 && (
                  <div
                    style={{
                      ...styles.statusPlanning,
                      width:
                        `${planningPercentage}%`
                    }}
                  />
                )}

                {upcomingPercentage > 0 && (
                  <div
                    style={{
                      ...styles.statusUpcoming,
                      width:
                        `${upcomingPercentage}%`
                    }}
                  />
                )}

                {completedPercentage > 0 && (
                  <div
                    style={{
                      ...styles.statusCompleted,
                      width:
                        `${completedPercentage}%`
                    }}
                  />
                )}

              </div>

              <div
                style={styles.legend}
              >

                <div
                  style={
                    styles.legendItem
                  }
                >
                  <span
                    style={{
                      ...styles.legendDot,
                      background:
                        "#2563eb"
                    }}
                  />

                  <span>
                    Planning
                  </span>

                  <strong>
                    {planningTrips}
                  </strong>
                </div>

                <div
                  style={
                    styles.legendItem
                  }
                >
                  <span
                    style={{
                      ...styles.legendDot,
                      background:
                        "#7c3aed"
                    }}
                  />

                  <span>
                    Upcoming
                  </span>

                  <strong>
                    {upcomingTrips}
                  </strong>
                </div>

                <div
                  style={
                    styles.legendItem
                  }
                >
                  <span
                    style={{
                      ...styles.legendDot,
                      background:
                        "#10b981"
                    }}
                  />

                  <span>
                    Completed
                  </span>

                  <strong>
                    {completedTrips}
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================
            RECENT TRIPS
        ==================================== */}

        <section style={styles.section}>

          <div
            style={styles.sectionHeader}
          >

            <h2
              style={styles.sectionTitle}
            >
              ✈️ Recent Trips
            </h2>

            <button
              style={styles.viewAll}
              onClick={() =>
                navigate("/trips")
              }
            >
              View All →
            </button>

          </div>

          {recentTrips.length === 0 ? (

            <div
              className="glass-card"
              style={styles.emptyCard}
            >

              <div
                style={styles.emptyIcon}
              >
                ✈️
              </div>

              <h3
                style={styles.emptyTitle}
              >
                No trips yet
              </h3>

              <p
                style={styles.emptyText}
              >
                Start planning your next
                adventure.
              </p>

              <button
                className="btn-aurora"
                onClick={() =>
                  navigate(
                    "/trips/create"
                  )
                }
              >
                Create Your First Trip
              </button>

            </div>

          ) : (

            <div
              style={styles.tripGrid}
            >

              {recentTrips.map((trip) => {

                const statusStyle =
                  getStatusStyle(
                    trip.status
                  );

                return (

                  <div
                    key={trip.id}
                    className="glass-card"
                    style={styles.tripCard}
                  >

                    <div
                      style={
                        styles.tripCardHeader
                      }
                    >

                      <div>

                        <h3
                          style={
                            styles.tripTitle
                          }
                        >
                          {trip.title}
                        </h3>

                        <p
                          style={
                            styles.destination
                          }
                        >
                          📍{" "}
                          {trip.destination}
                        </p>

                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...statusStyle
                        }}
                      >
                        {trip.status ||
                          "PLANNING"}
                      </span>

                    </div>

                    <div
                      style={
                        styles.tripDetails
                      }
                    >

                      <div>
                        <span
                          style={
                            styles.detailLabel
                          }
                        >
                          📅 Dates
                        </span>

                        <span
                          style={
                            styles.detailValue
                          }
                        >
                          {formatDate(
                            trip.startDate
                          )}{" "}
                          -{" "}
                          {formatDate(
                            trip.endDate
                          )}
                        </span>
                      </div>

                      <div>
                        <span
                          style={
                            styles.detailLabel
                          }
                        >
                          👥 Travelers
                        </span>

                        <span
                          style={
                            styles.detailValue
                          }
                        >
                          {trip.numberOfTravelers ||
                            0}
                        </span>
                      </div>

                      <div>
                        <span
                          style={
                            styles.detailLabel
                          }
                        >
                          💰 Budget
                        </span>

                        <span
                          style={
                            styles.detailValue
                          }
                        >
                          {formatCurrency(
                            trip.budget
                          )}
                        </span>
                      </div>

                    </div>

                    <button
                      style={
                        styles.tripButton
                      }
                      onClick={() =>
                        navigate(
                          `/trips/${trip.id}`
                        )
                      }
                    >
                      View Trip →
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

    </div>
  );
};


// ==========================================
// STYLES
// ==========================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#080d1a",
    color: "#f1f5f9"
  },

  main: {
    marginLeft: "260px",
    padding: "32px",
    minHeight: "100vh"
  },

  loading: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: "16px"
  },

  errorCard: {
    maxWidth: "500px",
    margin: "100px auto",
    padding: "40px",
    textAlign: "center"
  },

  errorIcon: {
    fontSize: "42px",
    marginBottom: "12px"
  },

  errorTitle: {
    color: "#f1f5f9",
    marginBottom: "10px"
  },

  errorText: {
    color: "#94a3b8",
    marginBottom: "22px"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px"
  },

  eyebrow: {
    color: "#7c3aed",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginBottom: "7px"
  },

  title: {
    color: "#f1f5f9",
    fontSize: "30px",
    fontWeight: "700",
    margin: 0,
    fontFamily:
      "'Space Grotesk', sans-serif"
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginTop: "8px"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "32px"
  },

  statCard: {
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },

  statIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    flexShrink: 0
  },

  statValue: {
    color: "#f1f5f9",
    fontSize: "21px",
    fontWeight: "700",
    margin: 0
  },

  statLabel: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "4px"
  },

  section: {
    marginBottom: "32px"
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },

  sectionTitle: {
    color: "#f1f5f9",
    fontSize: "18px",
    fontWeight: "600",
    margin: 0
  },

  viewAll: {
    border: "none",
    background: "transparent",
    color: "#a78bfa",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600"
  },

  // ==========================================
  // EXPENSE ANALYTICS
  // ==========================================

  expenseCount: {
    color: "#64748b",
    fontSize: "12px"
  },

  expenseStatsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "14px",
    marginBottom: "16px"
  },

  expenseStatCard: {
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px"
  },

  expenseIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0
  },

  expenseStatValue: {
    color: "#f1f5f9",
    fontSize: "16px",
    fontWeight: "700",
    margin: 0
  },

  expenseStatLabel: {
    color: "#64748b",
    fontSize: "11px",
    marginTop: "4px"
  },

  expenseAnalyticsCard: {
    padding: "22px"
  },

  expenseCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },

  progressTrack: {
    width: "100%",
    height: "12px",
    background:
      "rgba(255,255,255,0.06)",
    borderRadius: "20px",
    overflow: "hidden"
  },

  progressFill: {
    height: "100%",
    borderRadius: "20px",
    transition:
      "width 0.5s ease"
  },

  budgetLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    color: "#64748b",
    fontSize: "12px"
  },

  warningBox: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    background:
      "rgba(239,68,68,0.08)",
    border:
      "1px solid rgba(239,68,68,0.25)",
    color: "#fca5a5",
    fontSize: "12px"
  },

  expenseAnalyticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "16px",
    marginTop: "16px"
  },

  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  categoryItem: {
    position: "relative"
  },

  categoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "7px",
    color: "#cbd5e1",
    fontSize: "12px"
  },

  categoryName: {
    color: "#cbd5e1"
  },

  categoryTrack: {
    height: "7px",
    width: "100%",
    background:
      "rgba(255,255,255,0.06)",
    borderRadius: "10px",
    overflow: "hidden"
  },

  categoryFill: {
    height: "100%",
    background:
      "linear-gradient(90deg, #7c3aed, #06b6d4)",
    borderRadius: "10px",
    transition:
      "width 0.4s ease"
  },

  categoryPercentage: {
    display: "block",
    textAlign: "right",
    color: "#64748b",
    fontSize: "10px",
    marginTop: "4px"
  },

  noExpenseText: {
    color: "#64748b",
    fontSize: "13px",
    padding: "20px 0"
  },

  viewExpensesButton: {
    width: "100%",
    marginTop: "18px"
  },

  // ==========================================
  // TRIP ANALYTICS
  // ==========================================

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "16px",
    marginTop: "16px"
  },

  analyticsCard: {
    padding: "22px"
  },

  analyticsTitle: {
    color: "#f1f5f9",
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "15px"
  },

  analyticsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 0",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
    color: "#94a3b8",
    fontSize: "13px"
  },

  statusBar: {
    display: "flex",
    height: "14px",
    width: "100%",
    borderRadius: "20px",
    overflow: "hidden",
    background:
      "rgba(255,255,255,0.06)",
    marginBottom: "20px"
  },

  statusPlanning: {
    background: "#2563eb",
    transition:
      "width 0.4s ease"
  },

  statusUpcoming: {
    background: "#7c3aed",
    transition:
      "width 0.4s ease"
  },

  statusCompleted: {
    background: "#10b981",
    transition:
      "width 0.4s ease"
  },

  legend: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#94a3b8",
    fontSize: "12px"
  },

  legendDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%"
  },

  // ==========================================
  // RECENT TRIPS
  // ==========================================

  tripGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "16px"
  },

  tripCard: {
    padding: "20px"
  },

  tripCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "18px"
  },

  tripTitle: {
    color: "#f1f5f9",
    fontSize: "16px",
    fontWeight: "600",
    margin: 0
  },

  destination: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "5px"
  },

  statusBadge: {
    padding: "5px 9px",
    borderRadius: "7px",
    fontSize: "10px",
    fontWeight: "700",
    whiteSpace: "nowrap"
  },

  tripDetails: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr 1fr",
    gap: "12px",
    paddingTop: "15px",
    borderTop:
      "1px solid rgba(255,255,255,0.06)"
  },

  detailLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    marginBottom: "5px"
  },

  detailValue: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "11px",
    fontWeight: "500"
  },

  tripButton: {
    width: "100%",
    marginTop: "18px",
    padding: "9px",
    borderRadius: "8px",
    border:
      "1px solid rgba(124,58,237,0.3)",
    background:
      "rgba(124,58,237,0.08)",
    color: "#a78bfa",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600"
  },

  emptyCard: {
    padding: "60px 20px",
    textAlign: "center"
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "12px"
  },

  emptyTitle: {
    color: "#f1f5f9",
    fontSize: "17px",
    marginBottom: "6px"
  },

  emptyText: {
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "20px"
  }
};

export default Dashboard;