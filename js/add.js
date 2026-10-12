// หน้าเพิ่มคำสั่งซื้อ

const form = document.getElementById("order-form");
const shopField = document.getElementById("shop");
const bookField = document.getElementById("book");
const quantityField = document.getElementById("quantity");
const dateField = document.getElementById("order-date");
const priceText = document.getElementById("price-text");
const totalText = document.getElementById("total-text");
const formError = document.getElementById("form-error");

let books = [];

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function addOption(select, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.appendChild(option);
}

function selectedBook() {
  return books.find((b) => b.title === bookField.value);
}

// คืนจำนวนเล่มเป็นตัวเลข หรือ null ถ้ายังไม่ใช่จำนวนเต็มตั้งแต่ 1 ขึ้นไป
function readQuantity() {
  const text = quantityField.value.trim();
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value >= 1 ? value : null;
}

function updateTotal() {
  const book = selectedBook();
  const quantity = readQuantity();
  priceText.textContent = book ? formatMoney(book.price) : "-";
  totalText.textContent = book && quantity ? formatMoney(book.price * quantity) : "-";
}

function setError(field, message) {
  const box = document.getElementById(field.id + "-error");
  box.textContent = message;
  field.classList.toggle("invalid", message !== "");
}

// ตรวจทุกช่อง คืน true เมื่อกรอกครบและถูกต้อง
function validate() {
  let firstInvalid = null;
  const check = (field, message) => {
    setError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  };

  check(shopField, shopField.value ? "" : "กรุณาเลือกร้าน");
  check(bookField, bookField.value ? "" : "กรุณาเลือกหนังสือ");

  if (quantityField.value.trim() === "") {
    check(quantityField, "กรุณาใส่จำนวนเล่ม");
  } else if (readQuantity() === null) {
    check(quantityField, "จำนวนต้องเป็นตัวเลขจำนวนเต็มตั้งแต่ 1 ขึ้นไป");
  } else {
    check(quantityField, "");
  }

  if (!dateField.value) {
    check(dateField, "กรุณาเลือกวันที่สั่ง");
  } else if (dateField.value > todayIso()) {
    check(dateField, "วันที่สั่งต้องไม่เกินวันนี้");
  } else {
    check(dateField, "");
  }

  if (firstInvalid) {
    formError.textContent = "ยังบันทึกไม่ได้ กรุณากรอกข้อมูลให้ครบตามช่องที่มีข้อความสีแดง";
    firstInvalid.focus();
    return false;
  }
  formError.textContent = "";
  return true;
}

async function setup() {
  const shops = await OrderStore.listShops();
  books = await OrderStore.listBooks();

  for (const shop of shops) addOption(shopField, shop, shop);
  for (const book of books) addOption(bookField, book.title, book.title);

  dateField.value = todayIso();
  dateField.max = todayIso();
  updateTotal();
}

bookField.addEventListener("change", updateTotal);
quantityField.addEventListener("input", updateTotal);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validate()) return;

  await OrderStore.add({
    shop: shopField.value,
    book: bookField.value,
    quantity: readQuantity(),
    price: selectedBook().price,
    orderDate: dateField.value,
    status: "รอส่ง",
  });
  window.location.href = "index.html?saved=1";
});

setup();
