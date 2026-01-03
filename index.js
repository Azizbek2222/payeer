import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Reklama controllerlarini sozlash
let AdsgramController = null;
if (window.Adsgram) {
    AdsgramController = window.Adsgram.init({ blockId: "19356" }); // Block ID faqat raqam bo'lishi kerak
}

function getUserId() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        return "tg_" + window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    let id = localStorage.getItem('mining_uid') || "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('mining_uid', id);
    return id;
}

const userId = getUserId();

// ASOSIY CLAIM FUNKSIYASI
async function handleClaim() {
    const btn = document.getElementById('claimBtn');
    btn.disabled = true; // Double clickni oldini olish

    // Random tanlash: 0 - AdsGram, 1 - StarAds
    const randomChoice = Math.floor(Math.random() * 2);
    let adSuccess = false;

    try {
        if (randomChoice === 0 && AdsgramController) {
            console.log("AdsGram ko'rsatilmoqda...");
            const result = await AdsgramController.show();
            if (result.done) adSuccess = true;
        } else if (window.StarAds) {
            console.log("StarAds ko'rsatilmoqda...");
            // StarAds SDK-ingizga qarab show() yoki shunga o'xshash funksiyani ishlating
            const result = await window.StarAds.show(); 
            if (result) adSuccess = true;
        } else {
            // Agar tanlangan reklama yuklanmasa, zaxira sifatida AdsGramni urinib ko'ramiz
            if (AdsgramController) {
                const result = await AdsgramController.show();
                if (result.done) adSuccess = true;
            }
        }

        if (adSuccess) {
            await giveReward();
        } else {
            window.Telegram.WebApp.showAlert("Reklamani oxirigacha ko'rishingiz kerak!");
            btn.disabled = false;
        }
    } catch (err) {
        console.error("Reklama xatosi:", err);
        window.Telegram.WebApp.showAlert("Hozircha reklama mavjud emas. Birozdan so'ng urinib ko'ring.");
        btn.disabled = false;
    }
}

async function giveReward() {
    // Mukofot berish mantiqiy qismi (sizning eski kodingiz)
    startRocketAnimation();
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    const now = Date.now();
    const reward = 0.0001;

    if (snapshot.exists()) {
        const data = snapshot.val();
        await update(userRef, { 
            balance: (data.balance || 0) + reward, 
            lastClaim: now 
        });
    } else {
        await set(userRef, { balance: reward, lastClaim: now });
    }
    loadUserData();
}

// Global qilish
window.handleClaim = handleClaim;

// Animatsiya va ma'lumot yuklash funksiyalari (qisqartirilgan)
function startRocketAnimation() {
    const rocket = document.getElementById('rocket');
    rocket.classList.add('flying', 'animate__animated', 'animate__bounceOutUp');
    setTimeout(() => {
        rocket.classList.remove('animate__bounceOutUp');
        rocket.classList.add('animate__bounceInDown');
    }, 2000);
}

async function loadUserData() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('balance').innerText = (data.balance || 0).toFixed(6) + " TON";
    }
}

loadUserData();
