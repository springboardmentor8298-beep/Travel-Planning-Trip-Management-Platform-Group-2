import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TripService from "../services/tripService";
import api from "../services/api";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);

  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);

  const [selectedItineraryId, setSelectedItineraryId] =
    useState(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const [itineraryForm, setItineraryForm] = useState({
    date: "",
    notes: ""
  });

  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "SIGHTSEEING",
    cost: ""
  });

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "FOOD",
    amount: "",
    description: "",
    expenseDate: new Date()
      .toISOString()
      .split("T")[0]
  });

  // ======================================================
  // LOAD TRIP DATA
  // ======================================================

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    try {
      const [
        tripData,
        itineraryData,
        expenseData,
        documentData
      ] = await Promise.all([
        TripService.getTripById(id),
        TripService.getTripItineraries(id),
        api.get(`/trips/${id}/expenses`),
        api.get(`/trips/${id}/documents`)
      ]);

      setTrip(tripData);
      setItineraries(itineraryData);
      setExpenses(expenseData.data);
      setDocuments(documentData.data);
    } catch (err) {
      console.error("Error loading trip data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // ITINERARY
  // ======================================================

  const handleCreateItinerary = async () => {
    try {
      await TripService.createItinerary({
        ...itineraryForm,
        tripId: parseInt(id)
      });

      setShowItineraryForm(false);

      setItineraryForm({
        date: "",
        notes: ""
      });

      fetchTripData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    if (window.confirm("Delete this day plan?")) {
      try {
        await TripService.deleteItinerary(itineraryId);
        fetchTripData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ======================================================
  // ACTIVITY
  // ======================================================

  const handleCreateActivity = async () => {
    try {
      await TripService.createActivity({
        ...activityForm,
        itineraryId: selectedItineraryId,
        cost: activityForm.cost
          ? parseFloat(activityForm.cost)
          : null
      });

      setShowActivityForm(false);

      setActivityForm({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        type: "SIGHTSEEING",
        cost: ""
      });

      fetchTripData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm("Delete this activity?")) {
      try {
        await TripService.deleteActivity(activityId);
        fetchTripData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ======================================================
  // EXPENSES
  // ======================================================

  const fetchExpenses = async () => {
    try {
      setExpenseLoading(true);

      const res = await api.get(
        `/trips/${id}/expenses`
      );

      setExpenses(res.data);
    } catch (err) {
      console.error("Error loading expenses:", err);
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!expenseForm.title.trim()) {
      alert("Please enter expense title");
      return;
    }

    if (
      !expenseForm.amount ||
      Number(expenseForm.amount) <= 0
    ) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setExpenseLoading(true);

      await api.post(
        `/trips/${id}/expenses`,
        {
          title: expenseForm.title,
          category: expenseForm.category,
          amount: parseFloat(expenseForm.amount),
          description: expenseForm.description,
          expenseDate: expenseForm.expenseDate
        }
      );

      setExpenseForm({
        title: "",
        category: "FOOD",
        amount: "",
        description: "",
        expenseDate: new Date()
          .toISOString()
          .split("T")[0]
      });

      setShowExpenseForm(false);

      await fetchExpenses();

      alert("Expense added successfully!");
    } catch (err) {
      console.error("Error adding expense:", err);

      alert(
        err.response?.data?.message ||
        "Failed to add expense"
      );
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) {
      return;
    }

    try {
      await api.delete(
        `/expenses/${expenseId}`
      );

      await fetchExpenses();

      alert("Expense deleted successfully!");
    } catch (err) {
      console.error(
        "Error deleting expense:",
        err
      );

      alert(
        err.response?.data?.message ||
        "Failed to delete expense"
      );
    }
  };

  // ======================================================
  // DOCUMENTS
  // ======================================================

  const fetchDocuments = async () => {
    try {
      setDocumentLoading(true);

      const res = await api.get(
        `/trips/${id}/documents`
      );

      setDocuments(res.data);
    } catch (err) {
      console.error(
        "Error loading documents:",
        err
      );
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    try {
      setDocumentLoading(true);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      await api.post(
        `/trips/${id}/documents`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      setSelectedFile(null);
      setShowDocumentForm(false);

      await fetchDocuments();

      alert(
        "Document uploaded successfully!"
      );
    } catch (err) {
      console.error(
        "Error uploading document:",
        err
      );

      alert(
        err.response?.data?.message ||
        "Failed to upload document"
      );
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleDownloadDocument = async (
    documentId,
    fileName
  ) => {
    try {
      const response = await api.get(
        `/trips/${id}/documents/${documentId}/download`,
        {
          responseType: "blob"
        }
      );

      const url =
        window.URL.createObjectURL(
          new Blob([response.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        fileName
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Error downloading document:",
        err
      );

      alert(
        "Failed to download document"
      );
    }
  };

  const handleDeleteDocument = async (
    documentId
  ) => {
    if (
      !window.confirm(
        "Delete this document?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/trips/${id}/documents/${documentId}`
      );

      await fetchDocuments();

      alert(
        "Document deleted successfully!"
      );
    } catch (err) {
      console.error(
        "Error deleting document:",
        err
      );

      alert(
        err.response?.data?.message ||
        "Failed to delete document"
      );
    }
  };

  // ======================================================
  // CALCULATE BUDGET
  // ======================================================

  const totalBudget =
    Number(trip?.budget || 0);

  const totalSpent =
    expenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0
    );

  const remainingBudget =
    totalBudget - totalSpent;

  const budgetPercentage =
    totalBudget > 0
      ? Math.min(
          (totalSpent / totalBudget) * 100,
          100
        )
      : 0;

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />

        <main style={styles.main}>
          <p
            style={{
              color: "#94a3b8"
            }}
          >
            Loading...
          </p>
        </main>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div style={styles.container}>

      <Sidebar />

      <main style={styles.main}>

        {/* Back Button */}

        <button
          className="btn-ghost"
          onClick={() =>
            navigate("/trips")
          }
          style={{
            marginBottom: "24px",
            fontSize: "13px"
          }}
        >
          ← Back to Trips
        </button>

        {/* ================================================== */}
        {/* TRIP HEADER */}
        {/* ================================================== */}

        <div
          style={styles.tripHeader}
          className="glass-card"
        >

          <div
            style={styles.tripHeaderLeft}
          >

            <span
              style={{
                fontSize: "40px"
              }}
            >
              🌍
            </span>

            <div>

              <h1
                style={styles.tripTitle}
              >
                {trip?.title}
              </h1>

              <p
                style={styles.tripDest}
              >
                📍 {trip?.destination}
              </p>

              {trip?.description && (
                <p
                  style={styles.tripDesc}
                >
                  {trip.description}
                </p>
              )}

            </div>

          </div>

          <div
            style={styles.tripHeaderRight}
          >

            <button
              className="btn-aurora"
              onClick={() =>
                navigate(
                  `/trips/${id}/collaboration`
                )
              }
              style={{
                fontSize: "13px",
                padding: "8px 16px"
              }}
            >
              👥 Collaborate
            </button>

            <span
              className={`badge badge-${trip?.status?.toLowerCase()}`}
              style={{
                fontSize: "13px",
                padding: "6px 14px"
              }}
            >
              {trip?.status}
            </span>

            <div
              style={styles.tripMetaGrid}
            >

              {trip?.startDate && (
                <div
                  style={styles.metaBox}
                >
                  <p
                    style={styles.metaLabel}
                  >
                    Start
                  </p>

                  <p
                    style={styles.metaValue}
                  >
                    {trip.startDate}
                  </p>
                </div>
              )}

              {trip?.endDate && (
                <div
                  style={styles.metaBox}
                >
                  <p
                    style={styles.metaLabel}
                  >
                    End
                  </p>

                  <p
                    style={styles.metaValue}
                  >
                    {trip.endDate}
                  </p>
                </div>
              )}

              {trip?.numberOfTravelers && (
                <div
                  style={styles.metaBox}
                >
                  <p
                    style={styles.metaLabel}
                  >
                    Travelers
                  </p>

                  <p
                    style={styles.metaValue}
                  >
                    👥{" "}
                    {trip.numberOfTravelers}
                  </p>
                </div>
              )}

              <div
                style={styles.metaBox}
              >
                <p
                  style={styles.metaLabel}
                >
                  Budget
                </p>

                <p
                  style={styles.metaValue}
                >
                  💰 ₹
                  {totalBudget.toLocaleString()}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ================================================== */}
        {/* BUDGET & EXPENSES */}
        {/* ================================================== */}

        <div style={styles.section}>

          <div
            style={styles.sectionHeader}
          >

            <h2
              style={styles.sectionTitle}
            >
              💰 Budget & Expenses
            </h2>

            <button
              className="btn-aurora"
              onClick={() =>
                setShowExpenseForm(
                  !showExpenseForm
                )
              }
              style={{
                fontSize: "13px",
                padding: "8px 16px"
              }}
            >
              + Add Expense
            </button>

          </div>

          {/* Budget Summary */}

          <div style={styles.budgetGrid}>

            <div
              style={styles.budgetCard}
              className="glass-card"
            >
              <span
                style={styles.budgetIcon}
              >
                💰
              </span>

              <div>
                <p
                  style={styles.budgetLabel}
                >
                  Total Budget
                </p>

                <h3
                  style={styles.budgetValue}
                >
                  ₹
                  {totalBudget.toLocaleString()}
                </h3>
              </div>

            </div>

            <div
              style={styles.budgetCard}
              className="glass-card"
            >

              <span
                style={styles.budgetIcon}
              >
                💸
              </span>

              <div>

                <p
                  style={styles.budgetLabel}
                >
                  Total Spent
                </p>

                <h3
                  style={{
                    ...styles.budgetValue,
                    color: "#fbbf24"
                  }}
                >
                  ₹
                  {totalSpent.toLocaleString()}
                </h3>

              </div>

            </div>

            <div
              style={styles.budgetCard}
              className="glass-card"
            >

              <span
                style={styles.budgetIcon}
              >
                💵
              </span>

              <div>

                <p
                  style={styles.budgetLabel}
                >
                  Remaining
                </p>

                <h3
                  style={{
                    ...styles.budgetValue,
                    color:
                      remainingBudget >= 0
                        ? "#10b981"
                        : "#ef4444"
                  }}
                >
                  ₹
                  {remainingBudget.toLocaleString()}
                </h3>

              </div>

            </div>

          </div>

          {/* Progress */}

          <div
            style={styles.progressCard}
            className="glass-card"
          >

            <div
              style={styles.progressHeader}
            >

              <span>
                Budget Used
              </span>

              <strong>
                {budgetPercentage.toFixed(
                  1
                )}
                %
              </strong>

            </div>

            <div
              style={
                styles.progressBackground
              }
            >

              <div
                style={{
                  ...styles.progressBar,
                  width: `${budgetPercentage}%`
                }}
              />

            </div>

          </div>

          {/* Add Expense Form */}

          {showExpenseForm && (
            <div
              style={styles.inlineForm}
              className="glass-card"
            >

              <h3
                style={styles.formTitle}
              >
                Add Expense
              </h3>

              <div
                style={styles.expenseGrid}
              >

                <div
                  style={styles.inputGroup}
                >
                  <label
                    style={styles.label}
                  >
                    Expense Title
                  </label>

                  <input
                    className="aurora-input"
                    placeholder="Hotel, Food, Transport..."
                    value={
                      expenseForm.title
                    }
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        title:
                          e.target.value
                      })
                    }
                  />
                </div>

                <div
                  style={styles.inputGroup}
                >

                  <label
                    style={styles.label}
                  >
                    Category
                  </label>

                  <select
                    className="aurora-input"
                    value={
                      expenseForm.category
                    }
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        category:
                          e.target.value
                      })
                    }
                  >

                    <option value="FOOD">
                      🍴 Food
                    </option>

                    <option value="HOTEL">
                      🏨 Hotel
                    </option>

                    <option value="TRANSPORTATION">
                      🚗 Transportation
                    </option>

                    <option value="SHOPPING">
                      🛍️ Shopping
                    </option>

                    <option value="ENTERTAINMENT">
                      🎮 Entertainment
                    </option>

                    <option value="MISCELLANEOUS">
                      📦 Miscellaneous
                    </option>

                  </select>

                </div>

                <div
                  style={styles.inputGroup}
                >

                  <label
                    style={styles.label}
                  >
                    Amount (₹)
                  </label>

                  <input
                    className="aurora-input"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={
                      expenseForm.amount
                    }
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount:
                          e.target.value
                      })
                    }
                  />

                </div>

                <div
                  style={styles.inputGroup}
                >

                  <label
                    style={styles.label}
                  >
                    Date
                  </label>

                  <input
                    className="aurora-input"
                    type="date"
                    value={
                      expenseForm.expenseDate
                    }
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        expenseDate:
                          e.target.value
                      })
                    }
                  />

                </div>

                <div
                  style={{
                    ...styles.inputGroup,
                    gridColumn: "1 / -1"
                  }}
                >

                  <label
                    style={styles.label}
                  >
                    Description
                  </label>

                  <input
                    className="aurora-input"
                    placeholder="Optional description"
                    value={
                      expenseForm.description
                    }
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        description:
                          e.target.value
                      })
                    }
                  />

                </div>

              </div>

              <div
                style={styles.formActions}
              >

                <button
                  className="btn-ghost"
                  onClick={() =>
                    setShowExpenseForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="btn-aurora"
                  onClick={
                    handleCreateExpense
                  }
                  disabled={expenseLoading}
                >
                  {expenseLoading
                    ? "Saving..."
                    : "Save Expense"}
                </button>

              </div>

            </div>
          )}

          {/* Expense List */}

          <div
            style={styles.expenseList}
          >

            <h3
              style={
                styles.expenseListTitle
              }
            >
              Expense History
            </h3>

            {expenseLoading &&
            expenses.length === 0 ? (

              <div
                style={styles.emptyState}
                className="glass-card"
              >
                Loading expenses...
              </div>

            ) : expenses.length === 0 ? (

              <div
                style={styles.emptyState}
                className="glass-card"
              >

                <span
                  style={{
                    fontSize: "40px"
                  }}
                >
                  💸
                </span>

                <p
                  style={{
                    color: "#f1f5f9",
                    fontWeight: "600"
                  }}
                >
                  No expenses yet
                </p>

                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "14px"
                  }}
                >
                  Add your first trip
                  expense.
                </p>

              </div>

            ) : (

              <div
                style={styles.expenseItems}
              >

                {expenses.map(
                  (expense) => (

                    <div
                      key={expense.id}
                      style={
                        styles.expenseItem
                      }
                      className="glass-card"
                    >

                      <div
                        style={
                          styles.expenseLeft
                        }
                      >

                        <span
                          style={
                            styles.expenseIcon
                          }
                        >
                          {expense.category ===
                          "FOOD"
                            ? "🍴"
                            : expense.category ===
                              "HOTEL"
                            ? "🏨"
                            : expense.category ===
                              "TRANSPORTATION"
                            ? "🚗"
                            : expense.category ===
                              "SHOPPING"
                            ? "🛍️"
                            : expense.category ===
                              "ENTERTAINMENT"
                            ? "🎮"
                            : "📦"}
                        </span>

                        <div>

                          <p
                            style={
                              styles.expenseTitle
                            }
                          >
                            {expense.title}
                          </p>

                          <p
                            style={
                              styles.expenseMeta
                            }
                          >
                            {expense.category}

                            {expense.expenseDate
                              ? ` • ${expense.expenseDate}`
                              : ""}
                          </p>

                          {expense.description && (
                            <p
                              style={
                                styles.expenseDescription
                              }
                            >
                              {
                                expense.description
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      <div
                        style={
                          styles.expenseRight
                        }
                      >

                        <span
                          style={
                            styles.expenseAmount
                          }
                        >
                          ₹
                          {Number(
                            expense.amount
                          ).toLocaleString()}
                        </span>

                        <button
                          onClick={() =>
                            handleDeleteExpense(
                              expense.id
                            )
                          }
                          style={
                            styles.deleteBtn
                          }
                        >
                          🗑️
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

        {/* ================================================== */}
        {/* DOCUMENTS & PHOTOS */}
        {/* ================================================== */}

        <div style={styles.section}>

          <div
            style={styles.sectionHeader}
          >

            <h2
              style={styles.sectionTitle}
            >
              📁 Documents & Photos
            </h2>

            <button
              className="btn-aurora"
              onClick={() =>
                setShowDocumentForm(
                  !showDocumentForm
                )
              }
              style={{
                fontSize: "13px",
                padding: "8px 16px"
              }}
            >
              + Upload
            </button>

          </div>

          {/* Upload Form */}

          {showDocumentForm && (
            <div
              style={styles.inlineForm}
              className="glass-card"
            >

              <h3
                style={styles.formTitle}
              >
                Upload Document / Photo
              </h3>

              <div
                style={styles.inputGroup}
              >

                <label
                  style={styles.label}
                >
                  Select File
                </label>

                <input
                  className="aurora-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  onChange={(e) =>
                    setSelectedFile(
                      e.target.files[0]
                    )
                  }
                />

              </div>

              {selectedFile && (
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    marginTop: "10px"
                  }}
                >
                  Selected:{" "}
                  {selectedFile.name}
                </p>
              )}

              <div
                style={{
                  ...styles.formActions,
                  marginTop: "16px"
                }}
              >

                <button
                  className="btn-ghost"
                  onClick={() => {
                    setShowDocumentForm(
                      false
                    );
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="btn-aurora"
                  onClick={
                    handleUploadDocument
                  }
                  disabled={documentLoading}
                >
                  {documentLoading
                    ? "Uploading..."
                    : "Upload"}
                </button>

              </div>

            </div>
          )}

          {/* Documents */}

          {documentLoading &&
          documents.length === 0 ? (

            <div
              style={styles.emptyState}
              className="glass-card"
            >
              Loading documents...
            </div>

          ) : documents.length === 0 ? (

            <div
              style={styles.emptyState}
              className="glass-card"
            >

              <span
                style={{
                  fontSize: "40px"
                }}
              >
                📁
              </span>

              <p
                style={{
                  color: "#f1f5f9",
                  fontWeight: "600"
                }}
              >
                No documents yet
              </p>

              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px"
                }}
              >
                Upload tickets, bookings,
                IDs or travel photos.
              </p>

            </div>

          ) : (

            <div
              style={styles.documentItems}
            >

              {documents.map(
                (document) => (

                  <div
                    key={document.id}
                    style={
                      styles.documentItem
                    }
                    className="glass-card"
                  >

                    <div
                      style={
                        styles.documentLeft
                      }
                    >

                      <span
                        style={{
                          fontSize: "28px"
                        }}
                      >
                        {document.fileType?.startsWith(
                          "image/"
                        )
                          ? "🖼️"
                          : "📄"}
                      </span>

                      <div>

                        <p
                          style={
                            styles.documentTitle
                          }
                        >
                          {document.fileName}
                        </p>

                        <p
                          style={
                            styles.documentMeta
                          }
                        >
                          {document.fileType ||
                            "Document"}

                          {document.fileSize
                            ? ` • ${(
                                Number(
                                  document.fileSize
                                ) / 1024
                              ).toFixed(1)} KB`
                            : ""}
                        </p>

                      </div>

                    </div>

                    <div
                      style={
                        styles.documentActions
                      }
                    >

                      <button
                        className="btn-aurora"
                        onClick={() =>
                          handleDownloadDocument(
                            document.id,
                            document.fileName
                          )
                        }
                        style={{
                          fontSize: "12px",
                          padding: "6px 10px"
                        }}
                      >
                        ⬇️ Download
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteDocument(
                            document.id
                          )
                        }
                        style={
                          styles.deleteBtn
                        }
                      >
                        🗑️
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* ================================================== */}
        {/* ITINERARY */}
        {/* ================================================== */}

        <div style={styles.section}>

          <div
            style={styles.sectionHeader}
          >

            <h2
              style={styles.sectionTitle}
            >
              📅 Day-wise Itinerary
            </h2>

            <button
              className="btn-aurora"
              onClick={() =>
                setShowItineraryForm(true)
              }
              style={{
                fontSize: "13px",
                padding: "8px 16px"
              }}
            >
              + Add Day
            </button>

          </div>

          {/* Itinerary Form */}

          {showItineraryForm && (
            <div
              style={styles.inlineForm}
              className="glass-card"
            >

              <h3
                style={styles.formTitle}
              >
                Add Day Plan
              </h3>

              <div style={styles.formRow}>

                <div
                  style={styles.inputGroup}
                >

                  <label
                    style={styles.label}
                  >
                    Date
                  </label>

                  <input
                    className="aurora-input"
                    type="date"
                    value={
                      itineraryForm.date
                    }
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        date: e.target.value
                      })
                    }
                  />

                </div>

                <div
                  style={{
                    ...styles.inputGroup,
                    flex: 2
                  }}
                >

                  <label
                    style={styles.label}
                  >
                    Notes
                  </label>

                  <input
                    className="aurora-input"
                    placeholder="Day plan notes..."
                    value={
                      itineraryForm.notes
                    }
                    onChange={(e) =>
                      setItineraryForm({
                        ...itineraryForm,
                        notes: e.target.value
                      })
                    }
                  />

                </div>

              </div>

              <div
                style={styles.formActions}
              >

                <button
                  className="btn-ghost"
                  onClick={() =>
                    setShowItineraryForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="btn-aurora"
                  onClick={
                    handleCreateItinerary
                  }
                >
                  Add Day
                </button>

              </div>

            </div>
          )}

          {/* Activity Form */}

          {showActivityForm && (
            <div style={styles.modal}>

              <div
                style={styles.modalCard}
                className="glass-card"
              >

                <h3
                  style={styles.formTitle}
                >
                  Add Activity
                </h3>

                <div
                  style={
                    styles.activityFormGrid
                  }
                >

                  <div
                    style={styles.inputGroup}
                  >

                    <label
                      style={styles.label}
                    >
                      Title
                    </label>

                    <input
                      className="aurora-input"
                      placeholder="Activity title"
                      value={
                        activityForm.title
                      }
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          title: e.target.value
                        })
                      }
                    />

                  </div>

                  <div
                    style={styles.inputGroup}
                  >

                    <label
                      style={styles.label}
                    >
                      Type
                    </label>

                    <select
                      className="aurora-input"
                      value={
                        activityForm.type
                      }
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          type: e.target.value
                        })
                      }
                    >

                      {[
                        "SIGHTSEEING",
                        "TRANSPORTATION",
                        "ACCOMMODATION",
                        "DINING",
                        "ADVENTURE",
                        "SHOPPING",
                        "OTHER"
                      ].map((t) => (
                        <option
                          key={t}
                          value={t}
                          style={{
                            background:
                              "#0d1529"
                          }}
                        >
                          {t}
                        </option>
                      ))}

                    </select>

                  </div>

                  <div
                    style={styles.inputGroup}
                  >

                    <label
                      style={styles.label}
                    >
                      Start Time
                    </label>

                    <input
                      className="aurora-input"
                      type="time"
                      value={
                        activityForm.startTime
                      }
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          startTime:
                            e.target.value
                        })
                      }
                    />

                  </div>

                  <div
                    style={styles.inputGroup}
                  >

                    <label
                      style={styles.label}
                    >
                      End Time
                    </label>

                    <input
                      className="aurora-input"
                      type="time"
                      value={
                        activityForm.endTime
                      }
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          endTime:
                            e.target.value
                        })
                      }
                    />

                  </div>

                  <div
                    style={styles.inputGroup}
                  >

                    <label
                      style={styles.label}
                    >
                      Location
                    </label>

                    <input
                      className="aurora-input"
                      placeholder="Location"
                      value={
                        activityForm.location
                      }
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          location:
                            e.target.value
                        })
                      }
                    />

                  </div>

                  <div
                    style={styles.inputGroup}
                  >

                    <label
                      style={styles.label}
                    >
                      Cost (₹)
                    </label>

                    <input
                      className="aurora-input"
                      type="number"
                      placeholder="0"
                      value={
                        activityForm.cost
                      }
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          cost:
                            e.target.value
                        })
                      }
                    />

                  </div>

                  <div
                    style={{
                      ...styles.inputGroup,
                      gridColumn: "1 / -1"
                    }}
                  >

                    <label
                      style={styles.label}
                    >
                      Description
                    </label>

                    <input
                      className="aurora-input"
                      placeholder="Activity description"
                      value={
                        activityForm.description
                      }
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          description:
                            e.target.value
                        })
                      }
                    />

                  </div>

                </div>

                <div
                  style={
                    styles.formActions
                  }
                >

                  <button
                    className="btn-ghost"
                    onClick={() =>
                      setShowActivityForm(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="btn-aurora"
                    onClick={
                      handleCreateActivity
                    }
                  >
                    Add Activity
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* Itinerary List */}

          {itineraries.length === 0 ? (

            <div
              style={styles.emptyState}
              className="glass-card"
            >

              <span
                style={{
                  fontSize: "40px"
                }}
              >
                📅
              </span>

              <p
                style={{
                  color: "#f1f5f9",
                  fontWeight: "600"
                }}
              >
                No days planned yet
              </p>

              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px"
                }}
              >
                Add day-wise plans for
                your trip
              </p>

            </div>

          ) : (

            <div
              style={styles.itineraryList}
            >

              {itineraries.map((itin) => (

                <div
                  key={itin.id}
                  style={
                    styles.itineraryCard
                  }
                  className="glass-card"
                >

                  <div
                    style={
                      styles.itineraryHeader
                    }
                  >

                    <div>

                      <h3
                        style={
                          styles.itineraryDate
                        }
                      >
                        📅 {itin.date}
                      </h3>

                      {itin.notes && (
                        <p
                          style={
                            styles.itineraryNotes
                          }
                        >
                          {itin.notes}
                        </p>
                      )}

                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px"
                      }}
                    >

                      <button
                        className="btn-aurora"
                        onClick={() => {
                          setSelectedItineraryId(
                            itin.id
                          );

                          setShowActivityForm(
                            true
                          );
                        }}
                        style={{
                          fontSize: "12px",
                          padding: "6px 12px"
                        }}
                      >
                        + Activity
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteItinerary(
                            itin.id
                          )
                        }
                        style={
                          styles.deleteBtn
                        }
                      >
                        🗑️
                      </button>

                    </div>

                  </div>

                  {/* Activities */}

                  {itin.activities &&
                    itin.activities.length >
                      0 && (

                      <div
                        style={
                          styles.activitiesList
                        }
                      >

                        {itin.activities.map(
                          (activity) => (

                            <div
                              key={
                                activity.id
                              }
                              style={
                                styles.activityItem
                              }
                            >

                              <div
                                style={
                                  styles.activityLeft
                                }
                              >

                                <span
                                  style={
                                    styles.activityType
                                  }
                                >
                                  {activity.type ===
                                  "SIGHTSEEING"
                                    ? "👁️"
                                    : activity.type ===
                                      "DINING"
                                    ? "🍽️"
                                    : activity.type ===
                                      "TRANSPORTATION"
                                    ? "🚗"
                                    : activity.type ===
                                      "ACCOMMODATION"
                                    ? "🏨"
                                    : activity.type ===
                                      "ADVENTURE"
                                    ? "🏔️"
                                    : activity.type ===
                                      "SHOPPING"
                                    ? "🛍️"
                                    : "📌"}
                                </span>

                                <div>

                                  <p
                                    style={
                                      styles.activityTitle
                                    }
                                  >
                                    {
                                      activity.title
                                    }
                                  </p>

                                  {activity.location && (
                                    <p
                                      style={
                                        styles.activityLocation
                                      }
                                    >
                                      📍{" "}
                                      {
                                        activity.location
                                      }
                                    </p>
                                  )}

                                </div>

                              </div>

                              <div
                                style={
                                  styles.activityRight
                                }
                              >

                                {activity.startTime && (
                                  <span
                                    style={
                                      styles.activityTime
                                    }
                                  >
                                    {
                                      activity.startTime
                                    }{" "}
                                    {activity.endTime
                                      ? `- ${activity.endTime}`
                                      : ""}
                                  </span>
                                )}

                                {activity.cost && (
                                  <span
                                    style={
                                      styles.activityCost
                                    }
                                  >
                                    ₹
                                    {
                                      activity.cost
                                    }
                                  </span>
                                )}

                                <button
                                  onClick={() =>
                                    handleDeleteActivity(
                                      activity.id
                                    )
                                  }
                                  style={{
                                    ...styles.deleteBtn,
                                    padding:
                                      "4px 8px",
                                    fontSize:
                                      "12px"
                                  }}
                                >
                                  🗑️
                                </button>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
};

// ======================================================
// STYLES
// ======================================================

const styles = {

  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0a0f1e"
  },

  main: {
    marginLeft: "260px",
    flex: 1,
    padding: "32px"
  },

  tripHeader: {
    padding: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    gap: "24px"
  },

  tripHeaderLeft: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    flex: 1
  },

  tripTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#f1f5f9",
    fontFamily:
      "'Space Grotesk', sans-serif",
    marginBottom: "4px"
  },

  tripDest: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "8px"
  },

  tripDesc: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.5"
  },

  tripHeaderRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "16px"
  },

  tripMetaGrid: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end"
  },

  metaBox: {
    background:
      "rgba(255,255,255,0.05)",
    borderRadius: "8px",
    padding: "10px 14px",
    textAlign: "center",
    minWidth: "80px"
  },

  metaLabel: {
    color: "#64748b",
    fontSize: "11px",
    marginBottom: "4px"
  },

  metaValue: {
    color: "#f1f5f9",
    fontSize: "13px",
    fontWeight: "600"
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
    fontSize: "18px",
    fontWeight: "600",
    color: "#f1f5f9",
    fontFamily:
      "'Space Grotesk', sans-serif"
  },

  budgetGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "16px"
  },

  budgetCard: {
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },

  budgetIcon: {
    fontSize: "28px"
  },

  budgetLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "5px"
  },

  budgetValue: {
    color: "#f1f5f9",
    fontSize: "22px",
    fontWeight: "700",
    margin: 0
  },

  progressCard: {
    padding: "18px 20px",
    marginBottom: "16px"
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "10px"
  },

  progressBackground: {
    height: "10px",
    background:
      "rgba(255,255,255,0.08)",
    borderRadius: "20px",
    overflow: "hidden"
  },

  progressBar: {
    height: "100%",
    background:
      "linear-gradient(90deg, #7c3aed, #06b6d4)",
    borderRadius: "20px",
    transition: "width 0.4s ease"
  },

  inlineForm: {
    padding: "24px",
    marginBottom: "16px"
  },

  formTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: "16px"
  },

  formRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px"
  },

  expenseGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "20px"
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1
  },

  label: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500"
  },

  formActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end"
  },

  expenseList: {
    marginTop: "24px"
  },

  expenseListTitle: {
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "12px"
  },

  expenseItems: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  expenseItem: {
    padding: "16px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px"
  },

  expenseLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0
  },

  expenseIcon: {
    fontSize: "24px"
  },

  expenseTitle: {
    color: "#f1f5f9",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "3px"
  },

  expenseMeta: {
    color: "#a78bfa",
    fontSize: "11px",
    marginBottom: "3px"
  },

  expenseDescription: {
    color: "#64748b",
    fontSize: "12px"
  },

  expenseRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },

  expenseAmount: {
    color: "#10b981",
    fontSize: "15px",
    fontWeight: "700",
    whiteSpace: "nowrap"
  },

  // ======================================================
  // DOCUMENT STYLES
  // ======================================================

  documentItems: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  documentItem: {
    padding: "16px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px"
  },

  documentLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0
  },

  documentTitle: {
    color: "#f1f5f9",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "4px"
  },

  documentMeta: {
    color: "#94a3b8",
    fontSize: "11px"
  },

  documentActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },

  deleteBtn: {
    background:
      "rgba(239,68,68,0.1)",
    border:
      "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    borderRadius: "6px",
    cursor: "pointer",
    padding: "6px 10px",
    fontSize: "14px"
  },

  emptyState: {
    padding: "40px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px"
  },

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)"
  },

  modalCard: {
    width: "560px",
    maxWidth: "90vw",
    padding: "32px",
    maxHeight: "90vh",
    overflowY: "auto"
  },

  activityFormGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "16px",
    marginBottom: "24px"
  },

  itineraryList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  itineraryCard: {
    padding: "20px"
  },

  itineraryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px"
  },

  itineraryDate: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f1f5f9",
    fontFamily:
      "'Space Grotesk', sans-serif",
    marginBottom: "4px"
  },

  itineraryNotes: {
    color: "#94a3b8",
    fontSize: "13px"
  },

  activitiesList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderTop:
      "1px solid rgba(255,255,255,0.06)",
    paddingTop: "16px"
  },

  activityItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background:
      "rgba(255,255,255,0.03)",
    borderRadius: "8px"
  },

  activityLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  activityType: {
    fontSize: "20px"
  },

  activityTitle: {
    color: "#f1f5f9",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "2px"
  },

  activityLocation: {
    color: "#64748b",
    fontSize: "12px"
  },

  activityRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  activityTime: {
    color: "#a78bfa",
    fontSize: "12px"
  },

  activityCost: {
    color: "#10b981",
    fontSize: "12px",
    fontWeight: "500"
  }
};

export default TripDetail;