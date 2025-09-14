import { supabase } from "./supabasecon.js";

const pendingTable = document.getElementById("pendingTable");
const confirmedTable = document.getElementById("confirmedTable");
const declinedTable = document.getElementById("declinedTable");

// Load all requests
async function loadRequests() {
  pendingTable.innerHTML = "";
  confirmedTable.innerHTML = "";
  declinedTable.innerHTML = "";

  // 1️⃣ Pending bookings and rentals
  const { data: bookings } = await supabase.from("bookings").select("*").eq("status", "Pending");
  const { data: rentals } = await supabase.from("rentals").select("*").eq("status", "Pending");

  const pendingItems = [
    ...bookings.map(b => ({ ...b, type: "booking" })),
    ...rentals.map(r => ({ ...r, type: "rentals" }))
  ];

  pendingItems.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.email || "-"}</td>
      <td>${item.name || item.full_name || "-"}</td>
      <td>${item.type}</td>
      <td>${item.duration || "-"}</td>
      <td>${item.participants || "-"}</td>
      <td>${item.price || "-"}</td>
      <td>${item.class_date || item.datetime || "-"}</td>
      <td>${item.payment || "Unpaid"}</td>
      <td>Pending</td>
      <td>
        <button class="confirm-btn" data-id="${item.id}" data-type="${item.type}">Confirm</button>
        <button class="decline-btn" data-id="${item.id}" data-type="${item.type}">Decline</button>
      </td>
    `;
    pendingTable.appendChild(tr);
  });

  // 2️⃣ Confirmed
  const { data: confirmedBookings } = await supabase.from("bookings_admin").select("*").eq("status", "Confirmed");
  const { data: confirmedRentals } = await supabase.from("rentals_admin").select("*").eq("status", "Confirmed");
  [...confirmedBookings, ...confirmedRentals].forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.email || "-"}</td>
      <td>${item.name || item.full_name || "-"}</td>
      <td>${item.type}</td>
      <td>${item.duration || "-"}</td>
      <td>${item.participants || "-"}</td>
      <td>${item.price || "-"}</td>
      <td>${item.class_date || item.datetime || "-"}</td>
      <td>${item.payment || "Unpaid"}</td>
      <td>Confirmed</td>
      <td></td>
    `;
    confirmedTable.appendChild(tr);
  });

  // 3️⃣ Declined
  const { data: declinedBookings } = await supabase.from("bookings_admin").select("*").eq("status", "Declined");
  const { data: declinedRentals } = await supabase.from("rentals_admin").select("*").eq("status", "Declined");
  [...declinedBookings, ...declinedRentals].forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.email || "-"}</td>
      <td>${item.name || item.full_name || "-"}</td>
      <td>${item.type}</td>
      <td>${item.duration || "-"}</td>
      <td>${item.participants || "-"}</td>
      <td>${item.price || "-"}</td>
      <td>${item.class_date || item.datetime || "-"}</td>
      <td>${item.payment || "Unpaid"}</td>
      <td>Declined</td>
      <td></td>
    `;
    declinedTable.appendChild(tr);
  });

  attachActionHandlers();
}

// Confirm / Decline buttons
function attachActionHandlers() {
  pendingTable.onclick = async (e) => {
    const btn = e.target;
    if (!btn.classList.contains("confirm-btn") && !btn.classList.contains("decline-btn")) return;

    const id = Number(btn.dataset.id);
    const type = btn.dataset.type;
    const tableName = type === "booking" ? "bookings" : "rental_requests";
    const adminTable = type === "booking" ? "bookings_admin" : "rentals_admin";
    const status = btn.classList.contains("confirm-btn") ? "Confirmed" : "Declined";

    // Get full row data
    const row = btn.closest("tr");
    const rowData = {
      email: row.children[0].textContent,
      name: row.children[1].textContent,
      type: type,
      duration: row.children[3].textContent,
      participants: row.children[4].textContent,
      price: row.children[5].textContent,
      class_date: row.children[6].textContent,
      payment: row.children[7].textContent,
      status
    };

    try {
      // Insert into admin table
      const { error: insertError } = await supabase.from(adminTable).insert([rowData]);
      if (insertError) throw insertError;

      // Update status in original table to remove from pending
      const { error: updateError } = await supabase.from(tableName).update({ status }).eq("id", Number(id));
      if (updateError) throw updateError;

      // Reload tables
      loadRequests();
    } catch (err) {
      console.error("Error processing request:", err);
      alert("Failed to update status.");
    }
  };
}

// Initial load
window.addEventListener("DOMContentLoaded", loadRequests);