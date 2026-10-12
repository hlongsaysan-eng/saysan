// ตัวช่วยแสดงผลที่ใช้ร่วมกันทุกหน้า

function formatNumber(value) {
  return value.toLocaleString("th-TH");
}

function formatMoney(value) {
  return "฿" + value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// เลขที่คำสั่งซื้อ 4 หลัก เช่น 0007
function formatOrderNo(id) {
  return String(id).padStart(4, "0");
}

// แปลงวันที่แบบ 2026-10-08 เป็น 8 ต.ค. 2569
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status) {
  if (status === "รอส่ง") return "status-wait";
  if (status === "ส่งแล้ว") return "status-sent";
  return "status-paid";
}
