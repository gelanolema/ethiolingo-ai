
"use strict";

/* =========================================
   EthioLingo AI — STEP 4
   Theme, Counter, Clipboard, History, API
========================================= */

// 1. CONFIGURATION
const API_URL = "http://127.0.0.1:8000/translate";
const MAX_CHARACTERS = 5000;
const HISTORY_KEY = "ethioLingoHistory";
const THEME_KEY = "ethioLingoTheme";

// 2. HTML ELEMENTS
const sourceText = document.getElementById("sourceText");
const translatedText = document.getElementById("translatedText");
const characterCount = document.getElementById("characterCount");
const targetLanguage = document.getElementById("targetLanguage");

const themeToggle = document.getElementById("themeToggle");
const clearBtn = document.getElementById("clearBtn");
const pasteBtn = document.getElementById("pasteBtn");
const copyBtn = document.getElementById("copyBtn");
const translateBtn = document.getElementById("translateBtn");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const exportBtn = document.getElementById("exportBtn");
const translationStatus = document.getElementById("translationStatus");

// 3. APP STATE
let translationHistory = loadHistory();

// 4. NOTIFICATION
function notify(message) {
    console.log("EthioLingo AI:", message);

    let notification = document.getElementById("notification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "notification";
        notification.setAttribute("role", "status");

        Object.assign(notification.style, {
            position: "fixed",
            right: "20px",
            bottom: "20px",
            padding: "12px 18px",
            borderRadius: "10px",
            background: "#2563eb",
            color: "#ffffff",
            zIndex: "9999",
            maxWidth: "85%",
            boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
            fontSize: "14px"
        });

        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.display = "block";

    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

// 5. CHARACTER COUNTER
function updateCharacterCount() {
    if (!sourceText || !characterCount) return;

    const length = sourceText.value.length;

    characterCount.textContent =
        `${length} / ${MAX_CHARACTERS} characters`;
}

// 6. DARK MODE / LIGHT MODE
function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);

    if (themeToggle) {
        themeToggle.textContent = isDark ? "☀️" : "🌙";
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
        themeToggle.setAttribute("aria-pressed", String(isDark));
    }

    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        console.warn("Could not save theme:", error);
    }
}

function initializeTheme() {
    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem(THEME_KEY);
    } catch (error) {
        console.warn("Could not read saved theme:", error);
    }

    applyTheme(savedTheme === "dark" ? "dark" : "light");
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark-mode");

        applyTheme(isDark ? "light" : "dark");
        notify(isDark ? "Light mode enabled" : "Dark mode enabled");
    });
}

// 7. CLEAR INPUT AND OUTPUT
function clearText() {
    if (sourceText) {
        sourceText.value = "";
    }

    if (translatedText) {
        translatedText.textContent =
            "Your translation will appear here.";
    }

    if (translationStatus) {
        translationStatus.textContent = "Ready";
    }

    updateCharacterCount();

    if (sourceText) {
        sourceText.focus();
    }

    notify("Text cleared successfully!");
}

if (clearBtn) {
    clearBtn.addEventListener("click", clearText);
}


if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
        if (!sourceText) {
            notify("Input text field was not found.");
            return;
        }

        try {
            if (!navigator.clipboard?.readText) {
                notify("Use Ctrl + V inside the input box.");
                sourceText.focus();
                return;
            }

            const clipboardText = await navigator.clipboard.readText();

            if (!clipboardText) {
                notify("Your clipboard is empty.");
                return;
            }

            const remaining = MAX_CHARACTERS - sourceText.value.length;

            if (remaining <= 0) {
                notify("Maximum character limit reached.");
                return;
            }

            sourceText.value += clipboardText.slice(0, remaining);
            updateCharacterCount();
            notify("Text pasted successfully!");

        } catch (error) {
            console.warn("Clipboard permission unavailable:", error);

            sourceText.focus();
            notify("Paste permission blocked. Click the input and press Ctrl + V.");
        }
    });
}

// 9. COPY TRANSLATION
async function copyTranslation() {
    if (!translatedText) {
        notify("Translation output was not found.");
        return;
    }

    const text = translatedText.textContent.trim();

    if (
        !text ||
        text === "Your translation will appear here."
    ) {
        notify("There is no translation to copy.");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        notify("Translation copied successfully!");
    } catch (error) {
        // Fallback for browsers where Clipboard API is unavailable.
        const temporary = document.createElement("textarea");
        temporary.value = text;
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";

        document.body.appendChild(temporary);
        temporary.select();

        const copied = document.execCommand("copy");
        temporary.remove();

        if (copied) {
            notify("Translation copied successfully!");
        } else {
            notify("Copy failed. Please select and copy the text.");
        }
    }
}

if (copyBtn) {
    copyBtn.addEventListener("click", copyTranslation);
}

// 10. LOAD HISTORY SAFELY
function loadHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Could not load history:", error);
        return [];
    }
}

function saveHistory() {
    try {
        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(translationHistory)
        );
    } catch (error) {
        console.error("Could not save history:", error);
        notify("History could not be saved in this browser.");
    }
}

// 11. ADD TRANSLATION TO HISTORY
function addToHistory(original, translation, language) {
    const record = {
        id: Date.now(),
        original,
        translation,
        language,
        date: new Date().toLocaleString()
    };

    translationHistory.unshift(record);

    // Keep only the latest 50 records.
    translationHistory = translationHistory.slice(0, 50);

    saveHistory();
    renderHistory();
}

// 12. DISPLAY HISTORY
function renderHistory() {
    if (!historyList) return;

    historyList.replaceChildren();

    if (translationHistory.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No translations yet.";
        historyList.appendChild(emptyMessage);
        return;
    }

    translationHistory.forEach((item) => {
        const card = document.createElement("article");
        card.className = "history-item";

        const heading = document.createElement("h3");
        heading.textContent = item.language || "Translation";

        const date = document.createElement("small");
        date.textContent = item.date || "";

        const original = document.createElement("p");
        original.textContent = `English: ${item.original}`;

        const result = document.createElement("p");
        result.textContent = `Translation: ${item.translation}`;

        const copyButton = document.createElement("button");
        copyButton.type = "button";
        copyButton.textContent = "Copy";
        copyButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(item.translation);
                notify("History translation copied!");
            } catch (error) {
                notify("Could not copy this translation.");
            }
        });

        card.append(heading, date, original, result, copyButton);
        historyList.appendChild(card);
    });
}

// 13. CLEAR HISTORY
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
        if (translationHistory.length === 0) {
            notify("History is already empty.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to clear all translation history?"
        );

        if (!confirmed) return;

        translationHistory = [];
        saveHistory();
        renderHistory();

        notify("Translation history cleared.");
    });
}

// 14. EXPORT HISTORY AS CSV
if (exportBtn) {
    exportBtn.addEventListener("click", () => {
        if (translationHistory.length === 0) {
            notify("There is no history to export.");
            return;
        }

        function escapeCSV(value) {
            return '"' +
                String(value ?? "").replace(/"/g, '""') +
                '"';
        }

        const rows = [
            ["Date", "Language", "Original English", "Translation"],
            ...translationHistory.map((item) => [
                item.date,
                item.language,
                item.original,
                item.translation
            ])
        ];

        const csv = "\uFEFF" + rows
            .map(row => row.map(escapeCSV).join(","))
            .join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "ethioLingo-translation-history.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        notify("History exported successfully!");
    });
}

// 15. TRANSLATION API
async function translateText() {
    const original = sourceText?.value.trim() || "";
    const language = targetLanguage?.value || "Afaan Oromoo";

    if (!original) {
        translationStatus.textContent =
            "Please enter text to translate.";
        notify("Please enter text to translate.");
        sourceText?.focus();
        return;
    }

    if (original.length > MAX_CHARACTERS) {
        notify(`Maximum ${MAX_CHARACTERS} characters allowed.`);
        return;
    }

    if (!translatedText || !translationStatus) {
        console.error("Translation output or status element is missing.");
        notify("A required HTML element was not found.");
        return;
    }

    if (translateBtn) {
        translateBtn.disabled = true;
        translateBtn.textContent = "Translating...";
    }

    translationStatus.textContent = "Translating...";
    translatedText.textContent = "Please wait...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                text: original,
                target_language: language
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || `Request failed: ${response.status}`
            );
        }

        const result =
            data.translation ??
            data.translated_text ??
            data.translatedText ??
            data.result;

        if (typeof result !== "string" || !result.trim()) {
            throw new Error(
                "Translation was not found in the API response."
            );
        }

        translatedText.textContent = result;
        translationStatus.textContent = "Translation completed!";

        addToHistory(original, result, language);
        notify("Translation completed successfully!");

    } catch (error) {
        console.error("Translation API error:", error);

        translatedText.textContent =
            "Translation failed. Check the backend server and try again.";

        translationStatus.textContent = "Translation failed.";
        notify(
            error.message || "Could not connect to the translation API."
        );

    } finally {
        if (translateBtn) {
            translateBtn.disabled = false;
            translateBtn.textContent = "Translate Now →";
        }
    }
}

if (translateBtn) {
    translateBtn.addEventListener("click", translateText);
}


// 16. UPDATE COUNTER WHILE TYPING
if (sourceText) {
    sourceText.addEventListener("input", updateCharacterCount);
}

// 17. KEYBOARD SHORTCUT: Ctrl + Enter TO TRANSLATE
if (sourceText) {
    sourceText.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.key === "Enter") {
            event.preventDefault();
            translateText();
        }
    });
}

// 18. INITIALIZE THE APP
function initializeApp() {
    initializeTheme();
    updateCharacterCount();
    renderHistory();

    console.log("EthioLingo AI is ready!");
    console.log("Input element found:", !!sourceText);
    console.log("Output element found:", !!translatedText);
    console.log("Character counter found:", !!characterCount);
    console.log("History element found:", !!historyList);
}

initializeApp();
