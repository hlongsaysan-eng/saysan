// หน้าสรุปยอด

const TOP_SHOP_COUNT = 5;

function orderTotal(order) {
  return order.quantity * order.price;
}

function renderStatusCounts(orders) {
  const box = document.getElementById("status-cards");
  box.innerHTML = "";

  for (const status of STATUSES) {
    const count = orders.filter((o) => o.status === status).length;

    const card = document.createElement("div");
    card.className = "stat";

    const label = document.createElement("p");
    label.className = "stat-label";
    const badge = document.createElement("span");
    badge.className = "status " + statusClass(status);
    badge.textContent = status;
    label.appendChild(badge);

    const value = document.createElement("p");
    value.className = "stat-value";
    value.textContent = formatNumber(count);

    const unit = document.createElement("p");
    unit.className = "stat-sub";
    unit.textContent = "คำสั่งซื้อ";

    card.append(label, value, unit);
    box.appendChild(card);
  }
}

// รวมยอดต่อร้าน เรียงจากมากไปน้อย แล้วตัดเหลือ 5 อันดับแรก
function topShops(orders) {
  const totals = new Map();
  for (const order of orders) {
    totals.set(order.shop, (totals.get(order.shop) || 0) + orderTotal(order));
  }
  return [...totals.entries()]
    .map(([shop, total]) => ({ shop, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, TOP_SHOP_COUNT);
}

function renderTopShops(orders) {
  const list = document.getElementById("shop-bars");
  list.innerHTML = "";

  const shops = topShops(orders);
  const highest = shops.length ? shops[0].total : 0;

  shops.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "bar-row";

    const name = document.createElement("span");
    name.className = "bar-name";
    name.textContent = index + 1 + ". " + entry.shop;

    const track = document.createElement("span");
    track.className = "bar-track";
    const bar = document.createElement("span");
    bar.className = "bar";
    bar.style.width = (highest ? (entry.total / highest) * 100 : 0) + "%";
    track.appendChild(bar);

    const amount = document.createElement("span");
    amount.className = "bar-amount";
    amount.textContent = formatMoney(entry.total);

    item.append(name, track, amount);
    list.appendChild(item);
  });

  document.getElementById("shop-empty").hidden = shops.length > 0;
}

async function renderSummary() {
  const orders = await OrderStore.list();
  const unpaid = orders.filter((o) => o.status !== "ชำระแล้ว");
  const overdue = orders.filter(isOverdue);
  const sum = (list) => list.reduce((total, o) => total + orderTotal(o), 0);

  document.getElementById("total-sales").textContent = formatMoney(sum(orders));
  document.getElementById("total-sales-sub").textContent =
    "จากคำสั่งซื้อทั้งหมด " + formatNumber(orders.length) + " รายการ";

  document.getElementById("total-unpaid").textContent = formatMoney(sum(unpaid));
  document.getElementById("total-unpaid-sub").textContent =
    formatNumber(unpaid.length) + " รายการ ในจำนวนนี้ค้างเกิน " + OVERDUE_DAYS + " วัน " +
    formatNumber(overdue.length) + " รายการ " + formatMoney(sum(overdue));

  renderStatusCounts(orders);
  renderTopShops(orders);
}

renderSummary();
