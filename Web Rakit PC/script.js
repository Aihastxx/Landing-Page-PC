/* =========================================================
   SkyBoundNet — script.js (lengkap)
   Berisi: WhatsApp, menu mobile, simulasi rakit PC,
   header scroll, reveal on scroll, dan animasi kotak abstrak di hero.
========================================================= */

// Tandai bahwa JS aktif, supaya animasi reveal bisa dipakai.
document.documentElement.classList.add("js");

// Ganti dengan nomor WhatsApp bisnis Anda.
// Gunakan format 62, tanpa tanda +, spasi, atau tanda hubung.
// Contoh: 62882005230761
const WHATSAPP_NUMBER = "62882005230761";

const DEFAULT_MESSAGE =
    "Halo SkyBoundNet, saya ingin bertanya tentang layanan komputer.";

function getWhatsAppURL(message = DEFAULT_MESSAGE) {
    const number = WHATSAPP_NUMBER.replace(/\D/g, "");
    return "https://wa.me/" + number +
        "?text=" + encodeURIComponent(message);
}

["contactWhatsApp", "footerWhatsApp", "floatingWhatsApp", "infoWhatsApp", "infoWhatsAppText"]
    .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.href = getWhatsAppURL();
    });

document.querySelectorAll(".service-link").forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const service = this.dataset.service;
        const message =
            "Halo SkyBoundNet, saya ingin bertanya tentang " +
            service + ".";

        window.open(
            getWhatsAppURL(message),
            "_blank",
            "noopener,noreferrer"
        );
    });
});

/* =========================
   MENU NAVIGASI MOBILE
========================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// Tahun copyright otomatis.
document.getElementById("year").textContent =
    new Date().getFullYear();

/* =========================
   SIMULASI RAKIT PC
========================= */

const pcParts = [
    { id: "cpu", name: "Prosesor" },
    { id: "motherboard", name: "Motherboard" },
    { id: "ram", name: "RAM" },
    { id: "gpu", name: "Kartu Grafis" },
    { id: "storage", name: "SSD" },
    { id: "psu", name: "Power Supply" },
    { id: "cooler", name: "Pendingin CPU" },
    { id: "case", name: "Casing PC" }
];

const rupiah = amount =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);

function selectedPart(id) {
    const select = document.getElementById(id);
    const option = select.options[select.selectedIndex];

    return {
        name: option.textContent.trim(),
        price: Number(select.value),
        socket: option.dataset.socket || "",
        ram: option.dataset.ram || "",
        watt: Number(option.dataset.watt || 0),
        minwatt: Number(option.dataset.minwatt || 0),
        igpu: option.dataset.igpu || "",
        selected: select.selectedIndex > 0
    };
}

function checkCompatibility(parts) {
    const cpu = parts.cpu;
    const board = parts.motherboard;
    const ram = parts.ram;
    const gpu = parts.gpu;
    const psu = parts.psu;
    const cooler = parts.cooler;

    const problems = [];
    const notes = [];

    // 1. Cek Socket CPU vs Motherboard
    if (cpu.selected && board.selected && cpu.socket !== board.socket) {
        problems.push(
            `Socket CPU (${cpu.socket}) tidak cocok dengan motherboard (${board.socket}).`
        );
    }

    // 2. Cek RAM vs Motherboard
    if (board.selected && ram.selected && board.ram !== ram.ram) {
        problems.push(
            `Tipe RAM (${ram.ram}) tidak cocok dengan slot motherboard (${board.ram}).`
        );
    }

    // 3. Cek Daya PSU vs Rekomendasi GPU
    if (gpu.selected && psu.selected && gpu.minwatt > 0) {
        if (psu.watt < gpu.minwatt) {
            problems.push(
                `PSU ${psu.watt}W kurang dari rekomendasi minimal untuk GPU ini (${gpu.minwatt}W).`
            );
        }
    }

    // 4. Cek CPU tanpa iGPU dan tanpa GPU diskrit
    if (cpu.selected && cpu.igpu === "false" && (!gpu.selected || gpu.price === 0)) {
        problems.push(
            "Prosesor ini tidak memiliki grafis terintegrasi (iGPU). Wajib gunakan Kartu Grafis (GPU) tambahan agar PC dapat menampilkan gambar."
        );
    }

    // Catatan CPU tanpa pendingin bawaan
    if (
        cpu.selected &&
        (cpu.name.includes("KF") || cpu.name.includes("7800X3D") || cpu.name.includes("5700X")) &&
        (!cooler.selected || cooler.price === 0)
    ) {
        notes.push(
            "Prosesor ini tidak menyertakan pendingin bawaan. Disarankan memilih CPU Cooler terpisah."
        );
    }

    if (problems.length) {
        return {
            status: "error",
            message: "⚠ Perlu diperiksa: " + problems.join(" ")
        };
    }

    if (!cpu.selected || !board.selected || !ram.selected) {
        return {
            status: "warning",
            message:
                "Lengkapi pilihan CPU, motherboard, dan RAM untuk memeriksa kompatibilitas dasar."
        };
    }

    let successMsg = "✓ Kompatibilitas dasar komponen cocok!";
    if (notes.length) {
        successMsg += " ℹ Catatan: " + notes.join(" ");
    } else {
        successMsg += " Komponen utama siap dirakit.";
    }

    return {
        status: "good",
        message: successMsg
    };
}

function updateBuild() {
    const parts = {};

    pcParts.forEach(part => {
        parts[part.id] = selectedPart(part.id);
    });

    const list = document.getElementById("buildList");
    const compatibility = document.getElementById("compatibility");

    let total = 0;
    let html = "";

    pcParts.forEach(part => {
        const item = parts[part.id];

        if (item.selected) {
            total += item.price;

            html += `
                <div class="build-item">
                    <span>${part.name}</span>
                    <strong>${item.price > 0 ? rupiah(item.price) : "Termasuk / Rp0"}</strong>
                </div>
            `;
        }
    });

    list.innerHTML = html ||
        '<p class="empty-build">Belum ada komponen dipilih.</p>';

    document.getElementById("totalPrice").textContent =
        rupiah(total);

    const result = checkCompatibility(parts);

    compatibility.className = "compatibility " + result.status;
    compatibility.textContent = result.message;

    return { parts, total, result };
}

pcParts.forEach(part => {
    document.getElementById(part.id).addEventListener(
        "change",
        updateBuild
    );
});

document.getElementById("resetBuilder").addEventListener(
    "click",
    () => {
        pcParts.forEach(part => {
            document.getElementById(part.id).selectedIndex = 0;
        });

        updateBuild();
    }
);

document.getElementById("orderBuild").addEventListener(
    "click",
    () => {
        const build = updateBuild();

        const selected = pcParts
            .filter(part => build.parts[part.id].selected)
            .map(part =>
                "- " + part.name + ": " +
                build.parts[part.id].name +
                (build.parts[part.id].price > 0
                    ? " (" + rupiah(build.parts[part.id].price) + ")"
                    : " (Rp0)")
            );

        if (selected.length === 0) {
            alert("Silakan pilih komponen PC terlebih dahulu.");
            return;
        }

        const message = [
            "Halo SkyBoundNet, saya ingin konsultasi rakitan PC.",
            "",
            "Komponen pilihan:",
            ...selected,
            "",
            "Estimasi total: " + rupiah(build.total),
            "",
            "Status: " + build.result.message,
            "",
            "Mohon konfirmasi kompatibilitas dan harga aktual."
        ].join("\n");

        window.open(
            getWhatsAppURL(message),
            "_blank",
            "noopener,noreferrer"
        );
    }
);

updateBuild();

/* =========================
   HEADER SCROLL
========================= */

const headerEl = document.querySelector("header");

window.addEventListener("scroll", () => {
    headerEl.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

/* =========================
   ANIMASI KOTAK ABSTRAK DI HERO
   Kotak acak menyala lalu memudar pelan di atas grid tipis.
========================= */

(function () {
    const canvas = document.getElementById("heroBg");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;

    const SIZE = 56;                 // ukuran satu kotak (px)
    const GAP = 4;                   // jarak antar kotak yang menyala
    const DENSITY = 0.06;            // porsi kotak yang menyala bersamaan
    const COLOR = "201, 242, 92";    // sama dengan --volt di CSS
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, cols = 0, rows = 0;
    let cells = [];
    let running = false;
    let rafId = 0;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = hero.clientWidth;
        h = hero.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(w / SIZE);
        rows = Math.ceil(h / SIZE);
        cells = [];
        if (reduceMotion) drawStatic();
    }

    function drawGrid() {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= cols; x++) {
            ctx.moveTo(x * SIZE + 0.5, 0);
            ctx.lineTo(x * SIZE + 0.5, h);
        }
        for (let y = 0; y <= rows; y++) {
            ctx.moveTo(0, y * SIZE + 0.5);
            ctx.lineTo(w, y * SIZE + 0.5);
        }
        ctx.stroke();
    }

    function drawCell(cell, alpha) {
        ctx.fillStyle = "rgba(" + COLOR + ", " + alpha + ")";
        ctx.fillRect(
            cell.c * SIZE + GAP / 2,
            cell.r * SIZE + GAP / 2,
            SIZE - GAP,
            SIZE - GAP
        );
    }

    function newCell(now) {
        return {
            c: Math.floor(Math.random() * cols),
            r: Math.floor(Math.random() * rows),
            start: now,
            life: 2600 + Math.random() * 2600,
            peak: 0.10 + Math.random() * 0.16
        };
    }

    function drawStatic() {
        ctx.clearRect(0, 0, w, h);
        drawGrid();
        const count = Math.round(cols * rows * DENSITY);
        for (let i = 0; i < count; i++) drawCell(newCell(0), 0.1);
    }

    function frame(now) {
        ctx.clearRect(0, 0, w, h);
        drawGrid();

        const target = Math.round(cols * rows * DENSITY);
        if (cells.length < target && Math.random() < 0.08) {
            cells.push(newCell(now));
        }

        cells = cells.filter(cell => now - cell.start < cell.life);

        cells.forEach(cell => {
            const progress = (now - cell.start) / cell.life;
            drawCell(cell, cell.peak * Math.sin(Math.PI * progress));
        });

        if (running) rafId = requestAnimationFrame(frame);
    }

    function start() {
        if (running || reduceMotion) return;
        running = true;
        rafId = requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(rafId);
    }

    resize();
    window.addEventListener("resize", resize);

    // Hemat baterai: animasi berhenti saat hero tidak terlihat.
    new IntersectionObserver(entries => {
        entries[0].isIntersecting ? start() : stop();
    }).observe(hero);
})();

/* =========================
   REVEAL ON SCROLL
   Elemen dengan atribut data-reveal muncul halus saat masuk layar.
========================= */

(function () {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
        items.forEach(item => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
    });

    items.forEach(item => observer.observe(item));
})();
