package com.tripnest.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.tripnest.entity.*;
import com.tripnest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    private final TripRepository tripRepository;
    private final ItineraryRepository itineraryRepository;
    private final ActivityRepository activityRepository;
    private final ExpenseRepository expenseRepository;

    public ByteArrayInputStream generateTripPdf(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id " + tripId));

        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(30, 58, 138));
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.DARK_GRAY);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(30, 58, 138));
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

            // Title
            Paragraph title = new Paragraph("TripNest — " + trip.getTitle(), titleFont);
            title.setAlignment(Element.ALIGN_LEFT);
            document.add(title);

            Paragraph meta = new Paragraph("Destination: " + trip.getDestination() + " | Dates: " +
                    trip.getStartDate() + " to " + trip.getEndDate() + " | Status: " + trip.getStatus(), subtitleFont);
            meta.setSpacingAfter(15);
            document.add(meta);

            // 1. Trip Overview Section
            document.add(new Paragraph("Trip Overview", sectionFont));
            Paragraph overview = new Paragraph("Budget: INR " + (trip.getBudget() != null ? trip.getBudget() : 0.0) +
                    "  |  Travelers: " + (trip.getNumberOfTravelers() != 0 ? trip.getNumberOfTravelers() : 1) +
                    "\nDescription: " + (trip.getDescription() != null ? trip.getDescription() : "N/A"), bodyFont);
            overview.setSpacingAfter(15);
            document.add(overview);

            // 2. Itinerary Days & Activities
            document.add(new Paragraph("Day-wise Itinerary", sectionFont));
            List<Itinerary> itineraries = itineraryRepository.findByTripIdOrderByDayNumberAsc(tripId);

            if (itineraries.isEmpty()) {
                Paragraph noItin = new Paragraph("No itinerary days scheduled yet.", bodyFont);
                noItin.setSpacingAfter(15);
                document.add(noItin);
            } else {
                for (Itinerary day : itineraries) {
                    Paragraph dayHeader = new Paragraph("Day " + day.getDayNumber() + " (" + day.getDate() + ")", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.DARK_GRAY));
                    dayHeader.setSpacingBefore(5);
                    document.add(dayHeader);

                    List<Activity> activities = activityRepository.findByItineraryIdOrderByStartTimeAsc(day.getId());
                    if (!activities.isEmpty()) {
                        PdfPTable table = new PdfPTable(4);
                        table.setWidthPercentage(100);
                        table.setSpacingBefore(5);
                        table.setSpacingAfter(10);

                        addTableCell(table, "Time", headerFont, new Color(30, 58, 138));
                        addTableCell(table, "Activity", headerFont, new Color(30, 58, 138));
                        addTableCell(table, "Location", headerFont, new Color(30, 58, 138));
                        addTableCell(table, "Cost", headerFont, new Color(30, 58, 138));

                        for (Activity act : activities) {
                            addTableCell(table, (act.getStartTime() != null ? act.getStartTime() : "") + " - " + (act.getEndTime() != null ? act.getEndTime() : ""), bodyFont, null);
                            addTableCell(table, act.getName() + " (" + act.getActivityType() + ")", bodyFont, null);
                            addTableCell(table, act.getLocation() != null ? act.getLocation() : "-", bodyFont, null);
                            addTableCell(table, "INR " + (act.getCost() != null ? act.getCost() : 0), bodyFont, null);
                        }
                        document.add(table);
                    }
                }
            }

            // 3. Expenses Breakdown
            document.add(new Paragraph("Expense Summary", sectionFont));
            List<Expense> expenses = expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId);
            if (expenses.isEmpty()) {
                document.add(new Paragraph("No expenses recorded.", bodyFont));
            } else {
                PdfPTable expTable = new PdfPTable(4);
                expTable.setWidthPercentage(100);
                expTable.setSpacingBefore(5);
                expTable.setSpacingAfter(15);

                addTableCell(expTable, "Category", headerFont, new Color(30, 58, 138));
                addTableCell(expTable, "Description", headerFont, new Color(30, 58, 138));
                addTableCell(expTable, "Date", headerFont, new Color(30, 58, 138));
                addTableCell(expTable, "Amount", headerFont, new Color(30, 58, 138));

                double totalSpent = 0;
                for (Expense exp : expenses) {
                    addTableCell(expTable, exp.getCategory().name(), bodyFont, null);
                    addTableCell(expTable, exp.getDescription(), bodyFont, null);
                    addTableCell(expTable, exp.getExpenseDate() != null ? exp.getExpenseDate().toString() : "-", bodyFont, null);
                    double amt = exp.getAmount() != null ? exp.getAmount().doubleValue() : 0.0;
                    addTableCell(expTable, "INR " + amt, bodyFont, null);
                    totalSpent += amt;
                }
                document.add(expTable);

                Paragraph totalP = new Paragraph("Total Spent: INR " + totalSpent + " / Budget: INR " + (trip.getBudget() != null ? trip.getBudget() : 0.0), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11));
                totalP.setSpacingAfter(15);
                document.add(totalP);
            }

            document.close();
        } catch (DocumentException ex) {
            throw new RuntimeException("Error generating PDF", ex);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addTableCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setPadding(6);
        if (bgColor != null) {
            cell.setBackgroundColor(bgColor);
        }
        table.addCell(cell);
    }
}
