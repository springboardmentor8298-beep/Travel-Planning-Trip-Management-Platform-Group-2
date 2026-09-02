import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api, { getRecommendations, getDashboardAnalytics } from "../services/api";
import {
  FaSuitcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaWallet,
  FaCompass,
  FaPlusCircle,
  FaReceipt,
  FaBell,
  FaChartPie,
  FaChartLine,
  FaLightbulb,
  FaRoute,
  FaPassport,
  FaLuggageCart,
  FaCloudSun,
  FaExchangeAlt,
  FaMapMarkedAlt,
  FaClock,
  FaCoins,
  FaBan,
  FaFileAlt,
  FaInfoCircle,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  StatCard,
  QuickActionCard,
  TripItem,
  EmptyTripsState,
  TimelineItem,
  DestinationCard,
  TravelTipCard,
  DashboardSkeleton,
} from "../components/DashboardCard";
import "../styles/AppLayout.css";
import "../styles/Dashboard.css";

// Quotes List
const TRAVEL_QUOTES = [
  "“The world is a book and those who do not travel read only one page.” – St. Augustine",
  "“Travel is fatal to prejudice, bigotry, and narrow-mindedness.” – Mark Twain",
  "“Life is either a daring adventure or nothing at all.” – Helen Keller",
  "“To travel is to live.” – Hans Christian Andersen",
];

// Sample Destination Suggestions
const DESTINATION_SUGGESTIONS = [
  {
    id: 1,
    title: "Kyoto",
    country: "Japan",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
    description: "Explore ancient bamboo groves, serene zen temples, and traditional tea houses.",
  },
  {
    id: 2,
    title: "Santorini",
    country: "Greece",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80",
    description: "Iconic white-washed villas, cobalt blue domes, and breathtaking Aegean sunsets.",
  },
  {
    id: 3,
    title: "Amalfi Coast",
    country: "Italy",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
    description: "Dramatic cliffside villages, turquoise waters, and vibrant Mediterranean culture.",
  },
  {
    id: 4,
    title: "Kondaveedu Fort",
    country: "India",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
    description: "Historic 14th-century hill fortress featuring ramparts, temples, and panorama views.",
  },
];

function Dashboard() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    planningTrips: 0,
    totalBudget: 0,
    totalExpenses: 0,
    remainingBudget: 0,
    budgetUtilization: 0,
  });
  const [analyticsData, setAnalyticsData] = useState({
    expenseByCategory: {},
    tripStatusDistribution: {},
    budgetVsExpense: [],
    monthlySpending: [],
    upcomingVsCompleted: {},
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Dynamic user name from localStorage
  const userEmail = localStorage.getItem("email") || "Gowtham";
  const userName = userEmail.includes("@")
    ? userEmail.split("@")[0].charAt(0).toUpperCase() + userEmail.split("@")[0].slice(1)
    : userEmail;

  // Format today's date
  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [tripsResp, analyticsResp] = await Promise.allSettled([
          api.get("/trips"),
          getDashboardAnalytics(),
        ]);

        const rawTrips = tripsResp.status === "fulfilled" && Array.isArray(tripsResp.value.data)
          ? tripsResp.value.data
          : [];

        // Deduplicate trips by tripId / id
        const uniqueTripsMap = new Map();
        rawTrips.forEach((t) => {
          if (t && (t.tripId || t.id)) {
            const idKey = t.tripId || t.id;
            if (!uniqueTripsMap.has(idKey)) {
              uniqueTripsMap.set(idKey, t);
            }
          }
        });
        const allTrips = Array.from(uniqueTripsMap.values());
        setRecentTrips(allTrips.slice(0, 4));

        if (analyticsResp.status === "fulfilled" && analyticsResp.value?.data) {
          const a = analyticsResp.value.data;
          setStats({
            totalTrips: a.totalTrips || allTrips.length,
            upcomingTrips: a.upcomingTrips || 0,
            completedTrips: a.completedTrips || 0,
            cancelledTrips: a.cancelledTrips || 0,
            planningTrips: a.planningTrips || 0,
            totalBudget: a.totalBudget || 0,
            totalExpenses: a.totalExpenses || 0,
            remainingBudget: a.remainingBudget || 0,
            budgetUtilization: a.budgetUtilization || 0,
          });
          setAnalyticsData({
            expenseByCategory: a.expenseByCategory || {},
            tripStatusDistribution: a.tripStatusDistribution || {},
            budgetVsExpense: a.budgetVsExpense || [],
            monthlySpending: a.monthlySpending || [],
            upcomingVsCompleted: a.upcomingVsCompleted || {},
          });
        } else {
          // Fallback calculation from trips
          const upcoming = allTrips.filter((t) => t.status === "UPCOMING" || !t.status || t.status === "ACTIVE").length;
          const completed = allTrips.filter((t) => t.status === "COMPLETED").length;
          const cancelled = allTrips.filter((t) => t.status === "CANCELLED").length;
          const totalBudget = allTrips.reduce((acc, curr) => acc + (parseFloat(curr.budgetAllocated) || 0), 0);

          setStats({
            totalTrips: allTrips.length,
            upcomingTrips: upcoming,
            completedTrips: completed,
            cancelledTrips: cancelled,
            planningTrips: allTrips.length - (upcoming + completed + cancelled),
            totalBudget: totalBudget,
            totalExpenses: 0,
            remainingBudget: totalBudget,
            budgetUtilization: 0,
          });
        }

        // Fetch real backend recommendations
        try {
          const recResp = await getRecommendations();
          if (Array.isArray(recResp.data) && recResp.data.length > 0) {
            setRecommendations(recResp.data);
          }
        } catch (e) {
          console.warn("Could not fetch recommendations, using fallbacks.");
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Rotate quote every 8 seconds
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % TRAVEL_QUOTES.length);
    }, 8000);

    return () => clearInterval(quoteInterval);
  }, []);

  // 1. Status Distribution Data
  const statusPieData = useMemo(() => {
    const dist = analyticsData.tripStatusDistribution || {};
    const items = [
      { name: "Upcoming", value: dist["UPCOMING"] || stats.upcomingTrips || 0, color: "#38BDF8" },
      { name: "Completed", value: dist["COMPLETED"] || stats.completedTrips || 0, color: "#10B981" },
      { name: "Cancelled", value: dist["CANCELLED"] || stats.cancelledTrips || 0, color: "#EF4444" },
      { name: "Planning", value: dist["PLANNING"] || stats.planningTrips || 0, color: "#F59E0B" },
    ].filter(item => item.value > 0);

    if (items.length === 0) {
      return [{ name: "No Trips", value: 1, color: "#E2E8F0" }];
    }
    return items;
  }, [analyticsData.tripStatusDistribution, stats]);

  // 2. Expense by Category Data
  const categoryBarData = useMemo(() => {
    const catMap = analyticsData.expenseByCategory || {};
    return Object.entries(catMap).map(([key, val]) => ({
      category: key,
      amount: parseFloat(val) || 0,
    }));
  }, [analyticsData.expenseByCategory]);

  const hasCategoryExpenses = useMemo(() => {
    return categoryBarData.some(d => d.amount > 0);
  }, [categoryBarData]);

  // 3. Budget vs Actual Spent Data
  const budgetVsExpenseData = useMemo(() => {
    return (analyticsData.budgetVsExpense || []).map((t) => ({
      name: (t.tripName || `Trip #${t.tripId}`).length > 14
        ? (t.tripName || `Trip #${t.tripId}`).substring(0, 14) + "..."
        : (t.tripName || `Trip #${t.tripId}`),
      Budget: parseFloat(t.budget) || 0,
      Spent: parseFloat(t.spent) || 0,
    }));
  }, [analyticsData.budgetVsExpense]);

  // 4. Monthly Spending Data
  const monthlySpendingData = useMemo(() => {
    return (analyticsData.monthlySpending || []).map((m) => ({
      name: m.month,
      Amount: parseFloat(m.amount) || 0,
    }));
  }, [analyticsData.monthlySpending]);

  // Custom Chart Tooltip Component
  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="dash-chart-tooltip">
          <div className="dash-chart-tooltip-title">{label}</div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} style={{ color: entry.color || "#38BDF8", fontSize: "12px" }}>
              {entry.name}: ${Number(entry.value).toLocaleString()}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="app-dashboard-container">
      <Navbar />

      <div className="app-main-layout">
        <Sidebar />

        <main className="app-content-body">
          <div className="dashboard-root">
            {loading ? (
              <DashboardSkeleton />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="d-flex flex-column gap-4"
              >
                {/* ─────────────────────────────────────────────────────────────
                   HERO SECTION
                   ───────────────────────────────────────────────────────────── */}
                <div className="dash-hero-banner">
                  <div className="dash-hero-glow"></div>
                  <div className="dash-hero-content">
                    <div className="dash-hero-main">
                      <div className="dash-hero-meta-row">
                        <span className="dash-date-pill">
                          <FaCalendarAlt style={{ color: "#38BDF8" }} />
                          {todayDateStr}
                        </span>
                        <span className="dash-weather-pill">
                          <FaCloudSun /> 24°C Sunny • Paris
                        </span>
                      </div>
                      <h1 className="dash-hero-greeting">👋 Welcome back, {userName}!</h1>
                      <p className="dash-hero-subtext">
                        Ready for your next journey? Here is your personalized travel overview and itinerary summary.
                      </p>

                      <div className="dash-quote-box">
                        <span>{TRAVEL_QUOTES[quoteIndex]}</span>
                      </div>
                    </div>

                    <div className="dash-hero-actions">
                      <div className="dash-hero-badge-card">
                        <div className="dash-hero-badge-icon">
                          <FaRoute />
                        </div>
                        <div>
                          <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                            UPCOMING TRIP
                          </div>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>
                            {recentTrips.length > 0 ? recentTrips[0].destinationName : "No Trips Scheduled"}
                          </div>
                        </div>
                      </div>

                      <Link to="/trips/create" className="app-primary-btn" style={{ width: "100%", justifyContent: "center" }}>
                        <FaPlusCircle />
                        <span>Plan New Adventure</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   STATISTICS GRID (4 EQUAL CARDS IN ONE ROW)
                   ───────────────────────────────────────────────────────────── */}
                {/* ─────────────────────────────────────────────────────────────
                   STATISTICS GRID - ROW 1: TRIP VOLUMES & STATUSES
                   ───────────────────────────────────────────────────────────── */}
                <div className="dash-stats-grid">
                  <StatCard
                    label="Total Trips"
                    value={stats.totalTrips}
                    icon={FaSuitcase}
                    colorClass="icon-blue"
                    trend="All registered"
                  />
                  <StatCard
                    label="Upcoming Trips"
                    value={stats.upcomingTrips}
                    icon={FaCalendarAlt}
                    colorClass="icon-amber"
                    trend="Ready to go"
                  />
                  <StatCard
                    label="Completed Trips"
                    value={stats.completedTrips}
                    icon={FaCheckCircle}
                    colorClass="icon-emerald"
                    trend="Memories logged"
                  />
                  <StatCard
                    label="Cancelled Trips"
                    value={stats.cancelledTrips}
                    icon={FaBan}
                    colorClass="icon-rose"
                    trend="Cancelled / inactive"
                  />
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   STATISTICS GRID - ROW 2: FINANCIAL ALLOCATION & SPENDING
                   ───────────────────────────────────────────────────────────── */}
                <div className="dash-stats-grid">
                  <StatCard
                    label="Total Budget"
                    value={stats.totalBudget}
                    prefix="$"
                    icon={FaWallet}
                    colorClass="icon-sky"
                    trend="Combined allocation"
                  />
                  <StatCard
                    label="Total Expenses"
                    value={stats.totalExpenses}
                    prefix="$"
                    icon={FaReceipt}
                    colorClass="icon-rose"
                    trend="Actual spending"
                  />
                  <StatCard
                    label="Remaining Budget"
                    value={stats.remainingBudget}
                    prefix="$"
                    icon={FaCoins}
                    colorClass="icon-emerald"
                    trend="Available reserve"
                  />
                  <StatCard
                    label="Budget Utilization"
                    value={stats.budgetUtilization}
                    suffix="%"
                    icon={FaChartPie}
                    colorClass="icon-violet"
                    trend={stats.budgetUtilization > 100 ? "Over budget" : stats.budgetUtilization >= 80 ? "High usage" : "Within limits"}
                  />
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   QUICK ACTIONS (5 CARDS)
                   ───────────────────────────────────────────────────────────── */}
                <div>
                  <div className="dash-section-header">
                    <div>
                      <h2 className="dash-section-title">
                        <FaCompass style={{ color: "#38BDF8" }} />
                        Quick Actions
                      </h2>
                      <div className="dash-section-subtitle">Shortcuts to manage your travel workflow</div>
                    </div>
                  </div>

                  <div className="dash-actions-grid">
                    <QuickActionCard
                      to="/trips/create"
                      title="Create Trip"
                      description="Plan a brand new travel adventure from scratch"
                      icon={FaPlusCircle}
                      iconBg="#F0F9FF"
                      iconColor="#0EA5E9"
                    />
                    <QuickActionCard
                      to="/destinations"
                      title="Explore Places"
                      description="Discover trending spots and top travel locations"
                      icon={FaCompass}
                      iconBg="#F0F9FF"
                      iconColor="#0284C7"
                    />
                    <QuickActionCard
                      to="/itinerary"
                      title="Plan Itinerary"
                      description="Organize daily schedules and activity timelines"
                      icon={FaCalendarAlt}
                      iconBg="#FEF3C7"
                      iconColor="#D97706"
                    />
                    <QuickActionCard
                      to="/expenses"
                      title="Track Expenses"
                      description="Manage costs, budget allocations & payments"
                      icon={FaWallet}
                      iconBg="#E6F4EA"
                      iconColor="#10B981"
                    />
                    <QuickActionCard
                      to="/notifications"
                      title="Notifications"
                      description="Stay updated with real-time trip alerts"
                      icon={FaBell}
                      iconBg="#F3E8FF"
                      iconColor="#9333EA"
                    />
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   RECENT TRIPS & UPCOMING ACTIVITIES TIMELINE
                   ───────────────────────────────────────────────────────────── */}
                <div className="dash-main-grid">
                  {/* Recent Trips Left Column */}
                  <div className="dash-glass-card">
                    <div className="dash-section-header">
                      <div>
                        <h2 className="dash-section-title">
                          <FaSuitcase style={{ color: "#2563EB" }} />
                          Recent Trips
                        </h2>
                        <div className="dash-section-subtitle">Your latest travel bookings and itineraries</div>
                      </div>
                      <Link to="/trips" className="dash-link-action">
                        View All Trips →
                      </Link>
                    </div>

                    {recentTrips.length > 0 ? (
                      <div className="dash-trips-list">
                        {recentTrips.map((trip) => (
                          <TripItem key={trip.tripId} trip={trip} />
                        ))}
                      </div>
                    ) : (
                      <EmptyTripsState />
                    )}
                  </div>

                  {/* Upcoming Activities Right Column */}
                  <div className="dash-glass-card">
                    <div className="dash-section-header">
                      <div>
                        <h2 className="dash-section-title">
                          <FaClock style={{ color: "#FBBF24" }} />
                          Upcoming Timeline
                        </h2>
                        <div className="dash-section-subtitle">Scheduled activities for your active trips</div>
                      </div>
                    </div>

                    <div className="dash-timeline">
                      <TimelineItem
                        time="Today, 14:00 PM"
                        title="Flight Check-in & Gate Arrival"
                        destination="Charles de Gaulle Airport"
                        status="Confirmed"
                      />
                      <TimelineItem
                        time="Tomorrow, 10:30 AM"
                        title="Louvre Museum Guided Tour"
                        destination="Paris, France"
                        status="Scheduled"
                      />
                      <TimelineItem
                        time="July 26, 19:00 PM"
                        title="Sunset Seine River Cruise Dinner"
                        destination="Pont Neuf Pier"
                        status="Booked"
                      />
                      <TimelineItem
                        time="July 28, 11:00 AM"
                        title="Hotel Checkout & Taxi to Airport"
                        destination="Le Marais Hotel"
                        status="Pending"
                      />
                    </div>
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   ANALYTICS SECTION (5 RECHARTS VISUALIZATIONS)
                   ───────────────────────────────────────────────────────────── */}
                <div className="dash-glass-card">
                  <div className="dash-section-header">
                    <div>
                      <h2 className="dash-section-title">
                        <FaChartLine style={{ color: "#0EA5E9" }} />
                        Travel Analytics & Financial Intelligence
                      </h2>
                      <div className="dash-section-subtitle">Real-time statistics derived directly from your trips, budgets, and expenses</div>
                    </div>
                    <Link to="/reports" className="dash-link-action">
                      <FaFileAlt /> View Detailed Reports & Export CSV →
                    </Link>
                  </div>

                  <div className="dash-analytics-grid">
                    {/* CHART 1: Trip Status Distribution (Donut) */}
                    <div className="dash-chart-card">
                      <div className="dash-chart-title">
                        Trip Status Distribution
                      </div>
                      <div className="dash-chart-container">
                        {stats.totalTrips === 0 ? (
                          <div className="dash-chart-empty">
                            <FaInfoCircle size={28} />
                            <span>No trips planned yet. Create your first journey to view status breakdown.</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {statusPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomChartTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <div className="d-flex justify-content-center gap-3 mt-2 flex-wrap">
                        {statusPieData.map((item) => (
                          <div key={item.name} className="d-flex align-items-center gap-2" style={{ fontSize: "12px", color: "#475569" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }}></div>
                            <span>{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CHART 2: Expense by Category (Bar Chart) */}
                    <div className="dash-chart-card">
                      <div className="dash-chart-title">
                        Expense Breakdown by Category
                      </div>
                      <div className="dash-chart-container">
                        {!hasCategoryExpenses ? (
                          <div className="dash-chart-empty">
                            <FaReceipt size={28} />
                            <span>No expense records yet. Add trip expenses to see category distribution.</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                              <XAxis dataKey="category" stroke="#64748B" fontSize={10} angle={-25} textAnchor="end" />
                              <YAxis stroke="#64748B" fontSize={11} />
                              <Tooltip content={<CustomChartTooltip />} />
                              <Bar dataKey="amount" fill="#0284C7" radius={[6, 6, 0, 0]} name="Spent" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* CHART 3: Budget vs Actual Expense by Trip (Grouped Bar Chart) */}
                    <div className="dash-chart-card full-width">
                      <div className="dash-chart-title">
                        Budget Allocated vs Actual Spent by Trip
                      </div>
                      <div className="dash-chart-container" style={{ height: "260px" }}>
                        {budgetVsExpenseData.length === 0 ? (
                          <div className="dash-chart-empty">
                            <FaWallet size={28} />
                            <span>No trip budget data available. Allocate budgets to your journeys to compare.</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetVsExpenseData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                              <YAxis stroke="#64748B" fontSize={11} />
                              <Tooltip content={<CustomChartTooltip />} />
                              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                              <Bar dataKey="Budget" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Allocated Budget ($)" />
                              <Bar dataKey="Spent" fill="#EF4444" radius={[4, 4, 0, 0]} name="Actual Spent ($)" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* CHART 4: Monthly Spending Trends (Area Chart) */}
                    <div className="dash-chart-card">
                      <div className="dash-chart-title">
                        Monthly Spending Trajectory
                      </div>
                      <div className="dash-chart-container">
                        {monthlySpendingData.length === 0 ? (
                          <div className="dash-chart-empty">
                            <FaCoins size={28} />
                            <span>No chronological expense records logged.</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="spendGlow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                              <YAxis stroke="#64748B" fontSize={11} />
                              <Tooltip content={<CustomChartTooltip />} />
                              <Area type="monotone" dataKey="Amount" stroke="#10B981" fillOpacity={1} fill="url(#spendGlow)" strokeWidth={2} name="Total Spent ($)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* CHART 5: Upcoming vs Completed Trips */}
                    <div className="dash-chart-card">
                      <div className="dash-chart-title">
                        Upcoming vs Completed Journeys
                      </div>
                      <div className="dash-chart-container d-flex flex-column justify-content-center px-3">
                        <div className="mb-3">
                          <div className="d-flex justify-content-between text-sm mb-1" style={{ fontSize: "13px", fontWeight: 600 }}>
                            <span style={{ color: "#0284C7" }}>Upcoming / Active Trips</span>
                            <span>{stats.upcomingTrips}</span>
                          </div>
                          <div style={{ height: "10px", background: "#E0F2FE", borderRadius: "5px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${stats.totalTrips > 0 ? (stats.upcomingTrips / stats.totalTrips) * 100 : 0}%`,
                                height: "100%",
                                background: "#0284C7",
                                transition: "width 0.5s ease"
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between text-sm mb-1" style={{ fontSize: "13px", fontWeight: 600 }}>
                            <span style={{ color: "#16A34A" }}>Completed Journeys</span>
                            <span>{stats.completedTrips}</span>
                          </div>
                          <div style={{ height: "10px", background: "#DCFCE7", borderRadius: "5px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${stats.totalTrips > 0 ? (stats.completedTrips / stats.totalTrips) * 100 : 0}%`,
                                height: "100%",
                                background: "#16A34A",
                                transition: "width 0.5s ease"
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="d-flex justify-content-between text-sm mb-1" style={{ fontSize: "13px", fontWeight: 600 }}>
                            <span style={{ color: "#D97706" }}>Planning Phase</span>
                            <span>{stats.planningTrips}</span>
                          </div>
                          <div style={{ height: "10px", background: "#FEF3C7", borderRadius: "5px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${stats.totalTrips > 0 ? (stats.planningTrips / stats.totalTrips) * 100 : 0}%`,
                                height: "100%",
                                background: "#D97706",
                                transition: "width 0.5s ease"
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   DESTINATION SUGGESTIONS CAROUSEL
                   ───────────────────────────────────────────────────────────── */}
                <div>
                  <div className="dash-section-header">
                    <div>
                      <h2 className="dash-section-title">
                        <FaMapMarkedAlt style={{ color: "#38BDF8" }} />
                        Explore Recommended Destinations
                      </h2>
                      <div className="dash-section-subtitle">Handpicked places for your next unforgettable journey</div>
                    </div>
                    <Link to="/destinations" className="dash-link-action">
                      View All Places →
                    </Link>
                  </div>

                  <div className="dash-dest-carousel-wrap">
                    {recommendations.length > 0
                      ? recommendations.slice(0, 4).map((rec, idx) => (
                          <DestinationCard
                            key={rec.destination?.destinationId || idx}
                            title={rec.destination?.destinationName || "Destination"}
                            country={rec.destination?.country || rec.destination?.state || "India"}
                            rating={rec.destination?.rating ? rec.destination.rating.toString() : "4.8"}
                            image={rec.destination?.heroImage || DESTINATION_SUGGESTIONS[idx % DESTINATION_SUGGESTIONS.length].image}
                            description={rec.reason || rec.destination?.description}
                          />
                        ))
                      : DESTINATION_SUGGESTIONS.map((dest) => (
                          <DestinationCard
                            key={dest.id}
                            title={dest.title}
                            country={dest.country}
                            rating={dest.rating}
                            image={dest.image}
                            description={dest.description}
                          />
                        ))}
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                   TRAVEL TIPS & QUICK NOTIFICATION PANEL
                   ───────────────────────────────────────────────────────────── */}
                <div className="dash-main-grid">
                  {/* Travel Tips Left Column */}
                  <div>
                    <div className="dash-section-header">
                      <div>
                        <h2 className="dash-section-title">
                          <FaLightbulb style={{ color: "#FBBF24" }} />
                          Smart Travel Tips
                        </h2>
                        <div className="dash-section-subtitle">Essential guidelines for a seamless trip</div>
                      </div>
                    </div>

                    <div className="dash-tips-grid">
                      <TravelTipCard
                        icon={FaPassport}
                        title="Passport Validity"
                        description="Ensure your passport has at least 6 months validity from departure date."
                      />
                      <TravelTipCard
                        icon={FaLuggageCart}
                        title="Smart Packing"
                        description="Roll clothes instead of folding to save 30% baggage space."
                      />
                      <TravelTipCard
                        icon={FaCloudSun}
                        title="Weather Alerts"
                        description="Check local weather forecast 48h prior to flight departure."
                      />
                      <TravelTipCard
                        icon={FaExchangeAlt}
                        title="Currency & Cards"
                        description="Notify your bank before travel and carry modest cash for local vendors."
                      />
                    </div>
                  </div>

                  {/* Notifications Widget Right Column */}
                  <div className="dash-glass-card">
                    <div className="dash-section-header">
                      <div>
                        <h2 className="dash-section-title">
                          <FaBell style={{ color: "#C084FC" }} />
                          Recent Alerts
                        </h2>
                        <div className="dash-section-subtitle">Stay informed about your trips</div>
                      </div>
                      <span className="dash-status-badge badge-upcoming" style={{ fontSize: "11px" }}>
                        3 New
                      </span>
                    </div>

                    <div className="dash-notif-list">
                      <div className="dash-notif-item">
                        <div className="dash-notif-icon-box">
                          <FaCalendarAlt />
                        </div>
                        <div className="dash-notif-text-box">
                          <div className="dash-notif-title">Flight Reminder for Paris</div>
                          <div className="dash-notif-time">2 hours ago</div>
                        </div>
                      </div>

                      <div className="dash-notif-item">
                        <div className="dash-notif-icon-box" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399" }}>
                          <FaCheckCircle />
                        </div>
                        <div className="dash-notif-text-box">
                          <div className="dash-notif-title">Hotel Booking Confirmed</div>
                          <div className="dash-notif-time">Yesterday</div>
                        </div>
                      </div>

                      <div className="dash-notif-item">
                        <div className="dash-notif-icon-box" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}>
                          <FaWallet />
                        </div>
                        <div className="dash-notif-text-box">
                          <div className="dash-notif-title">Budget Updated for Tokyo</div>
                          <div className="dash-notif-time">3 days ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;