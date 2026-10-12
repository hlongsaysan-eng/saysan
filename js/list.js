// หน้ารายการคำสั่งซื้อ

function cell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function statusCell(order) {
  const td = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = "status " + statusClass(order.status);
  badge.textContent = order.status;
  td.appendChild(badge);

  if (isOverdue(order)) {
    const flag = document.createElement("span");
    flag.className = "overdue-flag";
    flag.textContent = "ค้างเกิน " + OVERDUE_DAYS + " วัน";
    td.appendChild(flag);
  }
  return td;
}

// ปุ่มเลื่อนสถานะไปขั้นถัดไป รายการที่ชำระแล้วไม่มีปุ่ม
function actionCell(order) {
  const td = document.createElement("td");
  const next = nextStatus(order.status);
  if (!next) return td;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button-small";
  button.textContent = "เปลี่ยนเป็น " + next;
  button.addEventListener("click", async () => {
    const question =
      "เปลี่ยนสถานะเลขที่ " + formatOrderNo(order.id) + " ของ" + order.shop +
      " เป็น " + next + " ใช่หรือไม่";
    if (!window.confirm(question)) return;
    await OrderStore.setStatus(order.id, next);
    document.getElementById("saved-notice").hidden = true;
    renderOrders();
  });
  td.appendChild(button);
  return td;
}

// ตัวกรองที่เลือกอยู่ ค่าว่างคือไม่กรอง
let searchText = "";
let statusFilter = "";

function matchesFilters(order) {
  if (statusFilter && order.status !== statusFilter) return false;
  const words = searchText.trim().toLowerCase();
  if (!words) return true;
  return order.shop.toLowerCase().includes(words) || order.book.toLowerCase().includes(words);
}

async function renderOrders() {
  const allOrders = await OrderStore.list();
  const orders = allOrders.filter(matchesFilters);
  const body = document.getElementById("order-rows");
  body.innerHTML = "";

  for (const order of orders) {
    const row = document.createElement("tr");
    row.appendChild(cell(formatOrderNo(order.id)));
    row.appendChild(cell(order.shop));
    row.appendChild(cell(order.book));
    row.appendChild(cell(formatNumber(order.quantity), "num"));
    row.appendChild(cell(formatMoney(order.quantity * order.price), "num"));
    row.appendChild(cell(formatDate(order.orderDate)));
    row.appendChild(statusCell(order));
    row.appendChild(actionCell(order));
    if (isOverdue(order)) row.className = "overdue";
    body.appendChild(row);
  }

  document.getElementById("no-result").hidden = orders.length > 0;
  document.getElementById("order-count").textContent =
    orders.length === allOrders.length
      ? "ทั้งหมด " + formatNumber(allOrders.length) + " รายการ"
      : "แสดง " + formatNumber(orders.length) + " จากทั้งหมด " + formatNumber(allOrders.length) + " รายการ";
}

document.getElementById("search").addEventListener("input", (event) => {
  searchText = event.target.value;
  renderOrders();
});

document.getElementById("status-filter").addEventListener("click", (event) => {
  const button = event.target.closest(".filter-button");
  if (!button) return;
  statusFilter = button.dataset.status;
  for (const other of document.querySelectorAll(".filter-button")) {
    other.classList.toggle("current", other === button);
  }
  renderOrders();
});

// มาจากหน้าเพิ่มคำสั่งซื้อหลังบันทึกสำเร็จ
if (new URLSearchParams(window.location.search).get("saved") === "1") {
  document.getElementById("saved-notice").hidden = false;
  history.replaceState(null, "", "index.html");
}

renderOrders();
