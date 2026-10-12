// ส่วนอ่านและบันทึกข้อมูล
// รอบแรกเก็บไว้ในเบราว์เซอร์ของเครื่องนี้ ช่วงบ่ายจะเปลี่ยนไฟล์นี้ไฟล์เดียวให้ไปใช้ Supabase
// หน้าเว็บทุกหน้าเรียกผ่าน OrderStore เท่านั้น ไม่แตะที่เก็บข้อมูลโดยตรง

// เปลี่ยนเลขท้ายเมื่อแก้ชุดข้อมูลสมมติ เพื่อให้เบราว์เซอร์ทิ้งชุดเก่าที่เคยเก็บไว้
const STORAGE_KEY = "amata-orders-v2";

const STATUSES = ["รอส่ง", "ส่งแล้ว", "ชำระแล้ว"];

// ข้อมูลสมมติทั้งหมด ไม่ใช่ร้านหรือหนังสือจริง
// รายชื่อร้านและหนังสือที่ให้เลือกในหน้าเพิ่มคำสั่งซื้อ
const SHOPS = [
  "ร้านกระดาษหอมยามเช้า",
  "ร้านชั้นหนังสือหมายเลขเก้า",
  "ร้านตัวอักษรริมเขาหมอก",
  "ร้านนกฮูกสีครามการอ่าน",
  "ร้านมุมอ่านใต้ต้นจามจุรีคู่",
  "ร้านหน้าสุดท้ายยังไม่จบ",
];

const BOOKS = [
  { title: "คณิตคิดสนุกกับลุงเต่าทอง", price: 145 },
  { title: "ครัวเล็กของยายปลาทู", price: 259 },
  { title: "จดหมายถึงเมืองที่ไม่มีในแผนที่", price: 295 },
  { title: "นิทานก่อนนอนชุดดาวดวงจิ๋วหลงทาง", price: 165 },
  { title: "ภาษาอังกฤษฉบับแมวส้มพาเที่ยว", price: 189 },
  { title: "สวนครัวบนระเบียงเมฆ", price: 220 },
];

const SAMPLE_ORDERS = [
  // วันที่กระจายย้อนหลัง 2 เดือนจาก 12 ต.ค. 2569 เลขที่ 2, 4, 5 ยังไม่ชำระและสั่งมาเกิน 30 วัน
  { id: 1, shop: "ร้านนกฮูกสีครามการอ่าน", book: "สวนครัวบนระเบียงเมฆ", quantity: 40, price: 220, orderDate: "2026-08-14", status: "ชำระแล้ว" },
  { id: 2, shop: "ร้านกระดาษหอมยามเช้า", book: "จดหมายถึงเมืองที่ไม่มีในแผนที่", quantity: 25, price: 295, orderDate: "2026-08-19", status: "ส่งแล้ว" },
  { id: 3, shop: "ร้านชั้นหนังสือหมายเลขเก้า", book: "คณิตคิดสนุกกับลุงเต่าทอง", quantity: 120, price: 145, orderDate: "2026-08-27", status: "ชำระแล้ว" },
  { id: 4, shop: "ร้านมุมอ่านใต้ต้นจามจุรีคู่", book: "ครัวเล็กของยายปลาทู", quantity: 30, price: 259, orderDate: "2026-09-02", status: "ส่งแล้ว" },
  { id: 5, shop: "ร้านนกฮูกสีครามการอ่าน", book: "จดหมายถึงเมืองที่ไม่มีในแผนที่", quantity: 15, price: 295, orderDate: "2026-09-08", status: "ส่งแล้ว" },
  { id: 6, shop: "ร้านกระดาษหอมยามเช้า", book: "ภาษาอังกฤษฉบับแมวส้มพาเที่ยว", quantity: 60, price: 189, orderDate: "2026-09-16", status: "ชำระแล้ว" },
  { id: 7, shop: "ร้านหน้าสุดท้ายยังไม่จบ", book: "สวนครัวบนระเบียงเมฆ", quantity: 20, price: 220, orderDate: "2026-09-24", status: "ส่งแล้ว" },
  { id: 8, shop: "ร้านชั้นหนังสือหมายเลขเก้า", book: "นิทานก่อนนอนชุดดาวดวงจิ๋วหลงทาง", quantity: 80, price: 165, orderDate: "2026-10-01", status: "ส่งแล้ว" },
  { id: 9, shop: "ร้านมุมอ่านใต้ต้นจามจุรีคู่", book: "ภาษาอังกฤษฉบับแมวส้มพาเที่ยว", quantity: 35, price: 189, orderDate: "2026-10-06", status: "รอส่ง" },
  { id: 10, shop: "ร้านตัวอักษรริมเขาหมอก", book: "ครัวเล็กของยายปลาทู", quantity: 50, price: 259, orderDate: "2026-10-10", status: "รอส่ง" },
];

const OVERDUE_DAYS = 30;

// ยังไม่ชำระและสั่งมาเกิน 30 วัน
function isOverdue(order) {
  if (order.status === "ชำระแล้ว") return false;
  const [year, month, day] = order.orderDate.split("-").map(Number);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((today - new Date(year, month - 1, day)) / 86400000);
  return days > OVERDUE_DAYS;
}

// สถานะถัดไป หรือ null ถ้าชำระแล้ว
function nextStatus(status) {
  const index = STATUSES.indexOf(status);
  return index >= 0 && index < STATUSES.length - 1 ? STATUSES[index + 1] : null;
}

function readAll() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
  return SAMPLE_ORDERS.slice();
}

function writeAll(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

const OrderStore = {
  async listShops() {
    return SHOPS.slice();
  },

  async listBooks() {
    return BOOKS.slice();
  },

  // คืนรายการทั้งหมด เรียงวันที่สั่งล่าสุดขึ้นก่อน
  async list() {
    return readAll().sort((a, b) => b.orderDate.localeCompare(a.orderDate) || b.id - a.id);
  },

  async add(order) {
    const orders = readAll();
    const nextId = orders.reduce((max, o) => Math.max(max, o.id), 0) + 1;
    const created = { ...order, id: nextId };
    orders.push(created);
    writeAll(orders);
    return created;
  },

  async setStatus(id, status) {
    const orders = readAll();
    const target = orders.find((o) => o.id === id);
    if (target) {
      target.status = status;
      writeAll(orders);
    }
    return target;
  },
};
