// بيانات تجريبية للمحادثات
const chats = [
  {
    id: 1,
    name: "أحمد محمد",
    avatar: "أ",
    color: "#128C7E",
    lastMsg: "تمام، هشوفك بكرة إن شاء الله",
    time: "10:42",
    unread: 2,
    status: "متصل",
    messages: [
      { text: "السلام عليكم", type: "in", time: "10:30" },
      { text: "وعليكم السلام ورحمة الله", type: "out", time: "10:31" },
      { text: "عامل إيه؟", type: "in", time: "10:32" },
      { text: "الحمد لله تمام، إنت عامل إيه؟", type: "out", time: "10:35" },
      { text: "كويس، في اجتماع بكرة الساعة 11", type: "in", time: "10:40" },
      { text: "تمام، هشوفك بكرة إن شاء الله", type: "out", time: "10:42" },
    ]
  },
  {
    id: 2,
    name: "سارة علي",
    avatar: "س",
    color: "#7B68EE",
    lastMsg: "الملف جاهز، هبعتوهولك دلوقتي",
    time: "09:15",
    unread: 0,
    status: "آخر ظهور اليوم الساعة 09:20",
    messages: [
      { text: "صباح الخير", type: "out", time: "09:00" },
      { text: "صباح النور", type: "in", time: "09:05" },
      { text: "الملف بتاع التقرير خلص؟", type: "out", time: "09:10" },
      { text: "الملف جاهز، هبعتوهولك دلوقتي", type: "in", time: "09:15" },
    ]
  },
  {
    id: 3,
    name: "مجموعة العمل",
    avatar: "ع",
    color: "#FF6B6B",
    lastMsg: "محمد: الاجتماع الساعة 3",
    time: "أمس",
    unread: 5,
    status: "12 عضو",
    messages: [
      { text: "صباح الخير جميعاً", type: "in", time: "08:00" },
      { text: "صباح النور", type: "out", time: "08:05" },
      { text: "محمد: الاجتماع الساعة 3", type: "in", time: "08:30" },
    ]
  },
  {
    id: 4,
    name: "خالد حسن",
    avatar: "خ",
    color: "#FFA500",
    lastMsg: "شكراً جداً 👍",
    time: "أمس",
    unread: 0,
    status: "آخر ظهور أمس الساعة 22:10",
    messages: [
      { text: "بعتلك اللينك", type: "out", time: "21:50" },
      { text: "وصلك؟", type: "out", time: "21:55" },
      { text: "أيوه وصله، شكراً جداً 👍", type: "in", time: "22:00" },
    ]
  },
  {
    id: 5,
    name: "نور الهدى",
    avatar: "ن",
    color: "#20B2AA",
    lastMsg: "إن شاء الله نشوفك قريب",
    time: "الأحد",
    unread: 0,
    status: "آخر ظهور الأحد الساعة 18:00",
    messages: [
      { text: "عامل إيه؟", type: "in", time: "17:30" },
      { text: "الحمد لله، وإنتي؟", type: "out", time: "17:40" },
      { text: "كويسة، إن شاء الله نشوفك قريب", type: "in", time: "17:50" },
    ]
  },
  {
    id: 6,
    name: "محمود إبراهيم",
    avatar: "م",
    color: "#9370DB",
    lastMsg: "أوكي",
    time: "السبت",
    unread: 0,
    status: "آخر ظهور السبت الساعة 14:00",
    messages: [
      { text: "هتروح المباراة؟", type: "out", time: "13:00" },
      { text: "لا مش فاضي", type: "in", time: "13:20" },
      { text: "أوكي", type: "out", time: "13:25" },
    ]
  }
];

let currentChatId = null;

// توليد QR Code
function generateQR() {
  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";
  // الـ QR بيشاور على الصفحة نفسها + باراميتر عشان لو اتفتح من الموبايل يدخل على طول
  const url = window.location.href.split("?")[0] + "?linked=1";
  new QRCode(qrDiv, {
    text: url,
    width: 220,
    height: 220,
    colorDark: "#111B21",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// الدخول للتطبيق
function enterApp() {
  const overlay = document.getElementById("qr-overlay");
  overlay.classList.add("active");

  setTimeout(() => {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    renderChatList();
  }, 1800);
}

// عرض قائمة المحادثات
function renderChatList(filter = "") {
  const list = document.getElementById("chat-list");
  list.innerHTML = "";

  const filtered = chats.filter(c =>
    c.name.includes(filter) || c.lastMsg.includes(filter)
  );

  filtered.forEach(chat => {
    const item = document.createElement("div");
    item.className = "chat-item" + (currentChatId === chat.id ? " active" : "");
    item.dataset.id = chat.id;

    item.innerHTML = `
      <div class="avatar" style="background:${chat.color}">${chat.avatar}</div>
      <div class="info">
        <div class="top-row">
          <span class="name">${chat.name}</span>
          <span class="time">${chat.time}</span>
        </div>
        <div class="preview ${chat.unread ? "unread" : ""}">
          ${chat.unread ? `<span class="badge">${chat.unread}</span>` : ""}
          ${chat.lastMsg}
        </div>
      </div>
    `;

    item.addEventListener("click", () => openChat(chat.id));
    list.appendChild(item);
  });
}

// فتح محادثة
function openChat(id) {
  currentChatId = id;
  const chat = chats.find(c => c.id === id);
  if (!chat) return;

  // تحديث القائمة
  document.querySelectorAll(".chat-item").forEach(el => {
    el.classList.toggle("active", Number(el.dataset.id) === id);
  });

  // إظهار المحادثة
  document.getElementById("empty-state").classList.add("hidden");
  document.getElementById("active-chat").classList.remove("hidden");

  // الهيدر
  document.getElementById("active-avatar").textContent = chat.avatar;
  document.getElementById("active-avatar").style.background = chat.color;
  document.getElementById("active-name").textContent = chat.name;
  document.getElementById("active-status").textContent = chat.status;

  // الرسائل
  const messagesEl = document.getElementById("messages");
  messagesEl.innerHTML = "";

  chat.messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.type}`;
    div.innerHTML = `
      ${msg.text}
      <div class="time">
        ${msg.time}
        ${msg.type === "out" ? '<span class="ticks">✓✓</span>' : ""}
      </div>
    `;
    messagesEl.appendChild(div);
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;

  // تصفير الـ unread
  chat.unread = 0;
  renderChatList(document.getElementById("search-input").value);

  // على الموبايل
  document.getElementById("app").classList.add("chat-open");
}

// إرسال رسالة
function sendMessage() {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text || !currentChatId) return;

  const chat = chats.find(c => c.id === currentChatId);
  const now = new Date();
  const time = now.getHours().toString().padStart(2, "0") + ":" +
               now.getMinutes().toString().padStart(2, "0");

  chat.messages.push({ text, type: "out", time });
  chat.lastMsg = text;
  chat.time = time;

  // عرض الرسالة
  const messagesEl = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "message out";
  div.innerHTML = `
    ${text}
    <div class="time">${time}<span class="ticks">✓✓</span></div>
  `;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  input.value = "";
  renderChatList(document.getElementById("search-input").value);
}

// الأحداث
document.addEventListener("DOMContentLoaded", () => {
  generateQR();

  // لو جاية من سكان QR
  const params = new URLSearchParams(window.location.search);
  if (params.get("linked") === "1") {
    enterApp();
  }

  document.getElementById("simulate-scan").addEventListener("click", enterApp);

  document.getElementById("search-input").addEventListener("input", (e) => {
    renderChatList(e.target.value);
  });

  document.getElementById("send-btn").addEventListener("click", sendMessage);

  document.getElementById("message-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
});
