document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            serviceCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('dropdown-toggle')) return;
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const searchBtn = document.getElementById('searchBtn');
    const searchBox = document.getElementById('searchBox');
    
    if (searchBtn && searchBox) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchBox.classList.toggle('active');
            if (searchBox.classList.contains('active')) {
                document.getElementById('searchInput').focus();
            }
        });

        searchBox.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    const dropdownLinks = document.querySelectorAll(".dropdown-menu a");
    dropdownLinks.forEach(link => {
        link.addEventListener("click", function() {
            const parentDropdown = this.closest('.dropdown');
            if (parentDropdown) {
                parentDropdown.classList.remove('active');
            }
        });
    });

    const dropdownMenus = document.querySelectorAll(".dropdown > .nav-link");
    dropdownMenus.forEach(menu => {
        menu.addEventListener("click", function(e) {
            e.stopPropagation();
            const parentDropdown = this.parentElement;
            document.querySelectorAll(".dropdown").forEach(item => {
                if (item !== parentDropdown) {
                    item.classList.remove("active");
                }
            });

            parentDropdown.classList.toggle("active");
        });
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll(".dropdown").forEach(item => {
                item.classList.remove("active");
            });
        }
        if (searchBox && !e.target.closest('.search-wrapper')) {
            searchBox.classList.remove('active');
        }
    });

    const input = document.getElementById("searchInput");
    if (input) {
        function clearSearchHighlights() {
            document.querySelectorAll(".search-match-highlight").forEach(mark => {
                const parent = mark.parentNode;
                if (parent) {
                    parent.replaceChild(document.createTextNode(mark.textContent), mark);
                    parent.normalize();
                }
            });
            const existingBanner = document.getElementById("searchResultBanner");
            if (existingBanner) existingBanner.remove();
        }

        function highlightKeywordInElement(el, keyword) {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
            const textNodes = [];
            let node;

            while ((node = walker.nextNode())) {
                if (!node.nodeValue || !node.nodeValue.trim()) continue;
                if (node.parentElement && node.parentElement.closest("#searchBox, script, style, .search-match-highlight")) {
                    continue;
                }
                if (node.nodeValue.toLowerCase().includes(keyword)) {
                    textNodes.push(node);
                }
            }

            let countInEl = 0;
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`(${escapedKeyword})`, "gi");

            textNodes.forEach(textNode => {
                const value = textNode.nodeValue;
                if (!regex.test(value)) return;
                regex.lastIndex = 0;

                const frag = document.createDocumentFragment();
                let lastIndex = 0;
                let match;

                while ((match = regex.exec(value)) !== null) {
                    if (match.index > lastIndex) {
                        frag.appendChild(document.createTextNode(value.slice(lastIndex, match.index)));
                    }

                    const mark = document.createElement("mark");
                    mark.className = "search-match-highlight";
                    mark.textContent = match[0];
                    mark.style.cssText = "background: #4ade80; color: #000; padding: 1px 3px; border-radius: 3px; font-weight: 600;";
                    frag.appendChild(mark);

                    lastIndex = regex.lastIndex;
                    countInEl++;
                }

                if (lastIndex < value.length) {
                    frag.appendChild(document.createTextNode(value.slice(lastIndex)));
                }

                textNode.parentNode.replaceChild(frag, textNode);
            });

            return countInEl;
        }

        input.addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                const keyword = this.value.toLowerCase().trim();
                clearSearchHighlights();
                if (!keyword) return;

                const candidates = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, td, th, label, a, button, span, div"));
                const targetElements = candidates.filter(el => {
                    if (el.closest("#searchBox, .modal, .mobile-nav-drawer")) return false;
                    const hasMatchingChild = Array.from(el.children).some(child =>
                        child.textContent && child.textContent.toLowerCase().includes(keyword)
                    );
                    return !hasMatchingChild && el.textContent && el.textContent.toLowerCase().includes(keyword);
                });

                let totalMatches = 0;
                const matchedMarks = [];

                targetElements.forEach(el => {
                    const hiddenTab = el.closest(".unit-tab-content:not(.active)");
                    if (hiddenTab && hiddenTab.id.startsWith("tab-")) {
                        const tabKey = hiddenTab.id.replace("tab-", "");
                        const pillBtn = Array.from(document.querySelectorAll(".cat-pill")).find(btn =>
                            (btn.getAttribute("onclick") || "").includes(`'${tabKey}'`)
                        );
                        if (pillBtn && typeof switchTab === "function") {
                            switchTab(tabKey, pillBtn);
                        }
                    }

                    const added = highlightKeywordInElement(el, keyword);
                    if (added > 0) {
                        totalMatches += added;
                        el.querySelectorAll(".search-match-highlight").forEach(m => matchedMarks.push(m));
                    }
                });

                if (totalMatches > 0) {
                    matchedMarks[0].scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                    const banner = document.createElement("div");
                    banner.id = "searchResultBanner";
                    banner.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: #111827; color: #f9fafb; border: 1px solid #4ade80; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; box-shadow: 0 10px 25px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 12px;";
                    banner.innerHTML = `
                        <span>Ditemukan <strong>${totalMatches}</strong> kata/hasil untuk "<strong>${this.value.trim()}</strong>"</span>
                        <button id="clearSearchBtn" type="button" style="background: #4ade80; color: #000; border: none; padding: 4px 10px; border-radius: 5px; font-weight: 600; cursor: pointer;">Hapus</button>
                    `;
                    document.body.appendChild(banner);

                    document.getElementById("clearSearchBtn").addEventListener("click", () => {
                        clearSearchHighlights();
                        input.value = "";
                    });
                } else {
                    alert("Data tidak ditemukan.");
                }
            }
        });
    }

    // LOGIKA BURGER MENU DRAWER & ACCORDION (HP)
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileDrawerClose = document.getElementById('mobileDrawerClose');

    function openMobileMenu() {
        if(mobileNavDrawer && mobileMenuOverlay) {
            mobileNavDrawer.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        if(mobileNavDrawer && mobileMenuOverlay) {
            mobileNavDrawer.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openMobileMenu);
    if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);

    const mobileDropdowns = document.querySelectorAll('.mobile-dropdown-btn');
    mobileDropdowns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;

            document.querySelectorAll('.mobile-dropdown').forEach(item => {
                if (item !== parent) {
                    item.classList.remove('open');
                }
            });

            parent.classList.toggle('open');
        });
    });

    const images = document.querySelectorAll("main img, .bumn-photo-card img");
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("fullImageDisplay");

    images.forEach(img => {
        img.classList.add("program-img");
        img.addEventListener("click", function(e) {
            e.stopPropagation();
            if (modal && modalImg) {
                modal.style.display = "flex";
                modalImg.src = this.src;
            }
        });
    });

    const openQuizBtn = document.getElementById("openQuizBtn");
    const quizModal = document.getElementById("quizModal");
    const closeQuizBtn = document.getElementById("closeQuizBtn");
    const quizQuestion = document.getElementById("quizQuestion");
    const quizOptions = document.getElementById("quizOptions");
    const quizFooter = document.getElementById("quizFooter");

    const quizData = [
        {
            question: "Apa fungsi utama dari kawasan hutan selain menghasilkan oksigen?",
            options: [
                "Tempat pembuangan akhir sampah",
                "Penyerap karbon dan penyangga tata air (mencegah erosi)",
                "Sumber bahan bangunan ilegal",
                "Lokasi balap liar"
            ],
            correct: 1
        },
        {
            question: "Organisasi atau sistem apa yang bermitra langsung dengan Perhutani dalam mengelola kawasan hutan bersama masyarakat?",
            options: [
                "LMDH (Lembaga Masyarakat Desa Hutan)",
                "Klub Sepak Bola Lokal",
                "Komunitas Pemancing Ikan",
                "Asosiasi Pedagang Pasar"
            ],
            correct: 0
        },
        {
            question: "Mengapa kegiatan penanaman pohon kembali (reboisasi) sangat penting bagi bumi?",
            options: [
                "Agar suhu bumi semakin panas",
                "Mengurangi keindahan alam",
                "Memulihkan fungsi ekosistem dan mencegah bencana longsor",
                "Menambah polusi udara"
            ],
            correct: 2
        }
    ];

    let currentQuestionIndex = 0;
    let score = 0;

    if (openQuizBtn && quizModal) {
        openQuizBtn.addEventListener("click", function () {
            quizModal.style.display = "flex";
            currentQuestionIndex = 0;
            score = 0;
            loadQuestion();
        });
    }

    if (closeQuizBtn && quizModal) {
        closeQuizBtn.addEventListener("click", function () {
            quizModal.style.display = "none";
        });
    }

    window.addEventListener("click", function (e) {
        if (e.target === quizModal) {
            quizModal.style.display = "none";
        }
    });

    function loadQuestion() {
        if (!quizQuestion || !quizOptions || !quizFooter) return;
        if (currentQuestionIndex < quizData.length) {
            const currentQ = quizData[currentQuestionIndex];
            quizQuestion.textContent = currentQ.question;
            quizOptions.innerHTML = "";

            currentQ.options.forEach((option, index) => {
                const btn = document.createElement("button");
                btn.textContent = option;
                btn.style.cssText = "width: 100%; text-align: left; padding: 10px 14px; background: #1f2937; border: 1px solid #374151; color: #f3f4f6; border-radius: 8px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;";
                
                btn.onmouseover = () => { btn.style.background = "#374151"; btn.style.borderColor = "#4ade80"; };
                btn.onmouseout = () => { btn.style.background = "#1f2937"; btn.style.borderColor = "#374151"; };

                btn.onclick = () => checkAnswer(index, currentQ.correct);
                quizOptions.appendChild(btn);
            });

            quizFooter.textContent = `Pertanyaan ${currentQuestionIndex + 1} dari ${quizData.length}`;
        } else {
            showResult();
        }
    }

    function checkAnswer(selected, correct) {
        if (selected === correct) {
            score++;
        }
        currentQuestionIndex++;
        loadQuestion();
    }

    function showResult() {
        quizQuestion.textContent = "🎉 Kuis Selesai!";
        quizOptions.innerHTML = `
            <div style="text-align: center; padding: 15px 0;">
                <p style="font-size: 1.1rem; margin-bottom: 10px; color: #4ade80;">Skor Anda: ${score} dari ${quizData.length}</p>
                <p style="font-size: 0.85rem; color: #9ca3af; margin-bottom: 20px;">Terima kasih sudah ikut menjaga kesadaran lingkungan bersama KPH Pemalang!</p>
                <button id="restartQuiz" style="background: #15803d; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;">Ulangi Kuis</button>
            </div>
        `;
        quizFooter.textContent = "Selesai";

        const restartBtn = document.getElementById("restartQuiz");
        if (restartBtn) {
            restartBtn.onclick = function () {
                currentQuestionIndex = 0;
                score = 0;
                loadQuestion();
            };
        }
    }

    console.log("Perhutani KPH Pemalang Website Loaded Successfully.");
});

async function updateWeatherPemalang() {
    const temperature = document.getElementById("temperature");
    const description = document.getElementById("weatherDescription");
    const icon = document.getElementById("weatherIcon");

    if (!temperature || !description || !icon) return;
    const latitude = -6.8947;
    const longitude = 109.3797;

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day` +
        `&timezone=Asia%2FJakarta`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Gagal mengambil data cuaca");
        }

        const data = await response.json();
        const weather = data.current;

        temperature.textContent =
            `${Math.round(weather.temperature_2m)}°C`;

        description.textContent =
            getWeatherDescription(weather.weather_code);

        icon.className = getWeatherIcon(
            weather.weather_code,
            weather.is_day
        );

        console.log("Cuaca Pemalang diperbarui:", weather);

    } catch (error) {
        console.error("Cuaca gagal dimuat:", error);

        temperature.textContent = "--°C";
        description.textContent = "Cuaca tidak tersedia";
        icon.className = "fa-solid fa-cloud";
    }
}

function getWeatherDescription(code) {
    if (code === 0) return "Cerah";
    if (code === 1 || code === 2) return "Cerah Berawan";
    if (code === 3) return "Berawan";
    if ([45, 48].includes(code)) return "Berkabut";
    if ([51, 53, 55].includes(code)) return "Gerimis";
    if ([56, 57].includes(code)) return "Gerimis Beku";
    if ([61, 63, 65].includes(code)) return "Hujan";
    if ([66, 67].includes(code)) return "Hujan Beku";
    if ([71, 73, 75, 77].includes(code)) return "Salju";
    if ([80, 81, 82].includes(code)) return "Hujan Deras";
    if ([85, 86].includes(code)) return "Salju Deras";
    if ([95].includes(code)) return "Badai Petir";
    if ([96, 99].includes(code)) return "Badai Petir & Hujan Es";
    return "Kondisi Berubah";
}

function getWeatherIcon(code, isDay) {
    if (code === 0) return isDay ? "fa-solid fa-sun" : "fa-solid fa-moon";
    if (code === 1 || code === 2) return isDay ? "fa-solid fa-cloud-sun" : "fa-solid fa-cloud-moon";
    if (code === 3) return "fa-solid fa-cloud";
    if ([45, 48].includes(code)) return "fa-solid fa-smog";
    if ([51, 53, 55, 56, 57].includes(code)) return "fa-solid fa-cloud-rain";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "fa-solid fa-cloud-showers-heavy";
    if ([95, 96, 99].includes(code)) return "fa-solid fa-cloud-bolt";
    return "fa-solid fa-cloud";
}

updateWeatherPemalang();
setInterval(updateWeatherPemalang, 10 * 60 * 1000);

const langToggle = document.querySelector(".lang-toggle");
const langButtons = document.querySelectorAll(".lang-option");

langButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedLanguage = button.dataset.lang;

        langButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        if (selectedLanguage === "en") {
            langToggle.classList.add("en");
        } else {
            langToggle.classList.remove("en");
        }

        langToggle.classList.add("clicked");

        setTimeout(() => {
            langToggle.classList.remove("clicked");
        }, 300);

        localStorage.setItem("selectedLanguage", selectedLanguage);
        console.log("Bahasa dipilih:", selectedLanguage);
    });
});

const savedLanguage = localStorage.getItem("selectedLanguage");
if (savedLanguage === "en") {
    const enButton = document.querySelector('.lang-option[data-lang="en"]');
    if (enButton) enButton.click();
} else {
    const idButton = document.querySelector('.lang-option[data-lang="id"]');
    if (idButton) idButton.classList.add("active");
}

function closeFullImage() {
    const imageModal = document.getElementById("imageModal");
    if (imageModal) {
        imageModal.style.display = "none";
    }
}

const appLauncherBtn = document.getElementById("appLauncherBtn");
const appLauncherDropdown = document.querySelector(".app-launcher-dropdown");
const complaintModal = document.getElementById("complaintModal");
const openComplaintBtn = document.getElementById("openComplaintBtn");
const closeComplaint = document.getElementById("closeComplaint");
const complaintForm = document.getElementById("complaintForm");

if (openComplaintBtn && complaintModal) {
    openComplaintBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        complaintModal.style.display = "flex";
    });
}

if (closeComplaint && complaintModal) {
    closeComplaint.addEventListener("click", function () {
        complaintModal.style.display = "none";
    });
}

window.addEventListener("click", function (e) {
    if (e.target === complaintModal) {
        complaintModal.style.display = "none";
    }
});

if (complaintForm) {
    complaintForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("cName").value.trim();
        const phone = document.getElementById("cPhone").value.trim();
        const category = document.getElementById("cCategory").value;
        const message = document.getElementById("cMessage").value.trim();
        const adminWhatsApp = "6281234567890";

        const text = `*LAYANAN PENGADUAN & ASPIRASI - KPH PEMALANG*%0A%0A` +
                     `*Nama:* ${name}%0A` +
                     `*No. HP:* ${phone}%0A` +
                     `*Kategori:* ${category}%0A` +
                     `*Pesan/Laporan:*%0A${message}`;

        const waUrl = `https://wa.me/${adminWhatsApp}?text=${text}`;
        window.open(waUrl, "_blank");

        complaintForm.reset();
        complaintModal.style.display = "none";
    });
}

function switchTab(tabKey, btnElement) {
    document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.unit-tab-content').forEach(tab => tab.classList.remove('active'));

    if (btnElement) {
        btnElement.classList.add('active');
    }

    const targetTab = document.getElementById('tab-' + tabKey);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    let targetId = hash;
    if (hash === 'tab-suararimba' || hash === 'suara-rimba') {
        targetId = 'suara-rimba';
    } else if (hash === 'tab-pengumuman' || hash === 'pengumuman') {
        targetId = 'pengumuman';
    }

    const tabKey = hash.replace('tab-', '');
    const targetTab = document.getElementById('tab-' + tabKey);

    if (targetTab) {
        let matchedBtn = null;
        document.querySelectorAll('.cat-pill').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick') || '';
            if (onclickAttr.includes("'" + tabKey + "'")) matchedBtn = btn;
        });

        switchTab(tabKey, matchedBtn);
        setTimeout(() => {
            targetTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return;
    }

    const target = document.getElementById(targetId);
    if (target) {
        setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
});
