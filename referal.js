import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDIeG8dVbm0Yk7FR1hPzrBoD7rgDKWAFoY",
    authDomain: "user1111-c84a0.firebaseapp.com",
    databaseURL: "https://user1111-c84a0-default-rtdb.firebaseio.com",
    projectId: "user1111-c84a0",
    storageBucket: "user1111-c84a0.firebasestorage.app",
    messagingSenderId: "901723757936",
    appId: "1:901723757936:web:9da0a1c7ec494f4a0c03b5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Telegram orqali User ID olish
const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
const userId = tgUser ? "tg_" + tgUser.id : localStorage.getItem('mining_uid');

// Referal havolani shakllantirish
if (userId) {
    const rawId = userId.replace("tg_", "");
    const botUsername = "rocket_mining_bot"; // O'zingizni bot username yozing
    const appName = "mining"; // O'zingizni app nomi
    const fullLink = `https://t.me/${botUsername}/${appName}?startapp=${rawId}`;
    document.getElementById('refLink').innerText = fullLink;
}

// Referal statistikani yuklash
async function loadStats() {
    const snapshot = await get(ref(db, 'users/' + userId));
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('refCount').innerText = data.referralCount || 0;
        document.getElementById('totalBonus').innerText = (data.referralEarnings || 0).toFixed(6) + " TON";
    }
}

loadStats();
