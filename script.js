/* =========================================================
   MFX TRADING LAB
   TRADING JOURNAL
   JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const addTradeBtn = document.getElementById("addTradeBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const tradeModal = document.getElementById("tradeModal");
    const tradeForm = document.getElementById("tradeForm");
    const tradeTableBody = document.getElementById("tradeTableBody");
    const emptyMessage = document.getElementById("emptyMessage");

    const searchInput = document.getElementById("searchInput");
    const resultFilter = document.getElementById("resultFilter");

    const downloadPngBtn = document.getElementById("downloadPngBtn");

    const modalTitle = document.getElementById("modalTitle");
    const saveTradeBtn = document.getElementById("saveTradeBtn");


    /* =====================================================
       FORM ELEMENTS
    ===================================================== */

    const tradeDate = document.getElementById("tradeDate");
    const tradePair = document.getElementById("tradePair");
    const tradeDirection = document.getElementById("tradeDirection");
    const tradeEntry = document.getElementById("tradeEntry");
    const tradeSL = document.getElementById("tradeSL");
    const tradeTP = document.getElementById("tradeTP");
    const tradeLot = document.getElementById("tradeLot");
    const tradeRisk = document.getElementById("tradeRisk");
    const tradeResult = document.getElementById("tradeResult");
    const tradeProfit = document.getElementById("tradeProfit");
    const tradeNotes = document.getElementById("tradeNotes");


    /* =====================================================
       STORAGE
    ===================================================== */

    let trades = JSON.parse(localStorage.getItem("mfxTradingJournal")) || [];

    let editingTradeId = null;


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    addTradeBtn.addEventListener("click", () => {

        editingTradeId = null;

        modalTitle.textContent = "Add Trade";
        saveTradeBtn.textContent = "Save Trade";

        tradeForm.reset();

        tradeDate.value = new Date().toISOString().split("T")[0];

        tradeModal.classList.add("active");
    });


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    closeModalBtn.addEventListener("click", () => {

        closeModal();

    });


    tradeModal.addEventListener("click", (event) => {

        if (event.target === tradeModal) {
            closeModal();
        }

    });


    function closeModal() {

        tradeModal.classList.remove("active");

        tradeForm.reset();

        editingTradeId = null;

    }


    /* =====================================================
       SAVE / UPDATE TRADE
    ===================================================== */

    tradeForm.addEventListener("submit", (event) => {

        event.preventDefault();


        const trade = {

            id: editingTradeId || Date.now(),

            date: tradeDate.value,

            pair: tradePair.value,

            direction: tradeDirection.value,

            entry: tradeEntry.value,

            sl: tradeSL.value,

            tp: tradeTP.value,

            lot: tradeLot.value,

            risk: tradeRisk.value,

            result: tradeResult.value,

            profit: tradeProfit.value || 0,

            notes: tradeNotes.value

        };


        /* =================================================
           UPDATE EXISTING TRADE
        ================================================= */

        if (editingTradeId) {

            trades = trades.map((item) => {

                if (item.id === editingTradeId) {
                    return trade;
                }

                return item;

            });

        }


        /* =================================================
           ADD NEW TRADE
        ================================================= */

        else {

            trades.push(trade);

        }


        saveTrades();

        renderTrades();

        closeModal();

    });


    /* =====================================================
       SAVE TO LOCAL STORAGE
    ===================================================== */

    function saveTrades() {

        localStorage.setItem(
            "mfxTradingJournal",
            JSON.stringify(trades)
        );

    }


    /* =====================================================
       RENDER TRADES
    ===================================================== */

    function renderTrades() {

        const searchText = searchInput.value.toLowerCase().trim();

        const selectedResult = resultFilter.value;


        const filteredTrades = trades.filter((trade) => {

            const matchesSearch =
                trade.pair.toLowerCase().includes(searchText) ||
                trade.notes.toLowerCase().includes(searchText);


            const matchesResult =
                selectedResult === "all" ||
                trade.result === selectedResult;


            return matchesSearch && matchesResult;

        });


        tradeTableBody.innerHTML = "";


        if (filteredTrades.length === 0) {

            emptyMessage.style.display = "block";

        } else {

            emptyMessage.style.display = "none";

        }


        filteredTrades.forEach((trade) => {

            const row = document.createElement("tr");


            /* RESULT CLASS */

            let resultClass = "";

            if (trade.result === "WIN") {
                resultClass = "result-win";
            }

            if (trade.result === "LOSS") {
                resultClass = "result-loss";
            }

            if (trade.result === "BE") {
                resultClass = "result-be";
            }

            if (trade.result === "MISSED") {
                resultClass = "result-missed";
            }


            /* P/L CLASS */

            let profitClass = "";

            const profitValue = Number(trade.profit);

            if (profitValue > 0) {
                profitClass = "profit-positive";
            }

            if (profitValue < 0) {
                profitClass = "profit-negative";
            }


            row.innerHTML = `

                <td>${formatDate(trade.date)}</td>

                <td>
                    <strong>${escapeHTML(trade.pair)}</strong>
                </td>

                <td>
                    ${escapeHTML(trade.direction)}
                </td>

                <td>
                    ${escapeHTML(trade.entry)}
                </td>

                <td>
                    ${escapeHTML(trade.sl)}
                </td>

                <td>
                    ${escapeHTML(trade.tp)}
                </td>

                <td>
                    ${escapeHTML(trade.lot)}
                </td>

                <td>
                    ${trade.risk ? "$" + escapeHTML(trade.risk) : "-"}
                </td>

                <td>
                    <span class="${resultClass}">
                        ${escapeHTML(trade.result)}
                    </span>
                </td>

                <td class="${profitClass}">
                    ${formatProfit(trade.profit)}
                </td>

                <td>
                    ${escapeHTML(trade.notes) || "-"}
                </td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editTrade(${trade.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTrade(${trade.id})"
                    >
                        Delete
                    </button>

                </td>

            `;


            tradeTableBody.appendChild(row);

        });


        updateStatistics();

    }


    /* =====================================================
       EDIT TRADE
    ===================================================== */

    window.editTrade = function(id) {

        const trade = trades.find((item) => item.id === id);

        if (!trade) {
            return;
        }


        editingTradeId = id;


        modalTitle.textContent = "Edit Trade";

        saveTradeBtn.textContent = "Update Trade";


        tradeDate.value = trade.date;

        tradePair.value = trade.pair;

        tradeDirection.value = trade.direction;

        tradeEntry.value = trade.entry;

        tradeSL.value = trade.sl;

        tradeTP.value = trade.tp;

        tradeLot.value = trade.lot;

        tradeRisk.value = trade.risk;

        tradeResult.value = trade.result;

        tradeProfit.value = trade.profit;

        tradeNotes.value = trade.notes;


        tradeModal.classList.add("active");

    };


    /* =====================================================
       DELETE TRADE
    ===================================================== */

    window.deleteTrade = function(id) {

        const trade = trades.find((item) => item.id === id);

        if (!trade) {
            return;
        }


        const confirmDelete = confirm(
            "Delete this trade?"
        );


        if (!confirmDelete) {
            return;
        }


        trades = trades.filter((item) => item.id !== id);


        saveTrades();

        renderTrades();

    };


    /* =====================================================
       SEARCH
    ===================================================== */

    searchInput.addEventListener("input", () => {

        renderTrades();

    });


    /* =====================================================
       RESULT FILTER
    ===================================================== */

    resultFilter.addEventListener("change", () => {

        renderTrades();

    });


    /* =====================================================
       STATISTICS
    ===================================================== */

    function updateStatistics() {

        const total = trades.length;


        const wins = trades.filter(
            (trade) => trade.result === "WIN"
        ).length;


        const losses = trades.filter(
            (trade) => trade.result === "LOSS"
        ).length;


        const breakEven = trades.filter(
            (trade) => trade.result === "BE"
        ).length;


        const totalProfit = trades.reduce(
            (total, trade) => total + Number(trade.profit || 0),
            0
        );


        const completedTrades = wins + losses;


        let winRate = 0;


        if (completedTrades > 0) {

            winRate = (wins / completedTrades) * 100;

        }


        document.getElementById("totalTrades").textContent = total;

        document.getElementById("totalWins").textContent = wins;

        document.getElementById("totalLosses").textContent = losses;

        document.getElementById("totalBE").textContent = breakEven;

        document.getElementById("winRate").textContent =
            winRate.toFixed(1) + "%";


        document.getElementById("totalProfit").textContent =
            formatProfit(totalProfit);

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(date) {

        if (!date) {
            return "-";
        }


        const parts = date.split("-");


        if (parts.length !== 3) {
            return date;
        }


        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }


    /* =====================================================
       FORMAT PROFIT
    ===================================================== */

    function formatProfit(value) {

        const number = Number(value || 0);


        if (number > 0) {

            return "+$" + number.toFixed(2);

        }


        if (number < 0) {

            return "-$" + Math.abs(number).toFixed(2);

        }


        return "$0.00";

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       DOWNLOAD JOURNAL AS PNG
    ===================================================== */

    downloadPngBtn.addEventListener("click", async () => {

        if (typeof html2canvas === "undefined") {

            alert(
                "PNG download library is not available."
            );

            return;

        }


        const tableWrapper =
            document.querySelector(".table-wrapper");


        const originalOverflow =
            tableWrapper.style.overflow;


        tableWrapper.style.overflow = "visible";


        try {

            const canvas = await html2canvas(
                tableWrapper,
                {
                    backgroundColor: "#ffffff",
                    scale: 2,
                    useCORS: true
                }
            );


            const link =
                document.createElement("a");


            link.download =
                "MFX-Trading-Journal.png";


            link.href =
                canvas.toDataURL("image/png");


            link.click();


        } catch (error) {

            console.error(error);

            alert(
                "Unable to create the PNG."
            );

        }


        tableWrapper.style.overflow =
            originalOverflow;

    });


    /* =====================================================
       INITIAL RENDER
    ===================================================== */

    renderTrades();

});