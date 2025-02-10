document.addEventListener("DOMContentLoaded", function() {
    const qrCodeContainer = document.getElementById("qrCode");
    const readerContainer = document.getElementById("reader");

    document.getElementById("generateQR").addEventListener("click", () => {
        let amount = document.getElementById("amount").value;
        qrCodeContainer.innerHTML = "";
        new QRCode(qrCodeContainer, {
            text: `Amount: ${amount}`,
            width: 128,
            height: 128
        });
        storeOffline(`QR Payment: ${amount}`);
    });

    document.getElementById("scanQR").addEventListener("click", () => {
        document.getElementById("qrScanner").style.display = "block";
        let html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                storeOffline(`Received Payment: ${decodedText}`);
                html5QrCode.stop();
                document.getElementById("qrScanner").style.display = "none";
                alert("QR Code Scanned: " + decodedText);
            },
            (errorMessage) => {}
        );
    });

    document.getElementById("sendSound").addEventListener("click", () => {
        let amount = document.getElementById("amount").value;
        playSound(amount);
        storeOffline(`Sound Payment: ${amount}`);
    });

    document.getElementById("listenSound").addEventListener("click", () => {
        listenForSound();
    });

    document.getElementById("syncPayments").addEventListener("click", () => {
        syncToBank();
    });

    function storeOffline(transaction) {
        let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        transactions.push(transaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));
        updateTransactionHistory();
    }

    function updateTransactionHistory() {
        let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        document.getElementById("transactionHistory").innerHTML = transactions.map(t => `<li>${t}</li>`).join("");
    }

    function playSound(amount) {
        let context = new (window.AudioContext || window.webkitAudioContext)();
        let oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(500 + parseInt(amount) * 10, context.currentTime);
        oscillator.connect(context.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 1);
    }

    function listenForSound() {
        alert("Listening for sound payments is now enabled.");
        // Implement frequency detection for full functionality
    }

    function syncToBank() {
        let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        if (transactions.length === 0) {
            alert("No transactions to sync.");
            return;
        }

        fetch("https://your-bank-api.com/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions: transactions })
        })
        .then(response => response.json())
        .then(data => {
            alert("Transactions synced to bank!");
            localStorage.setItem("transactions", "[]");
            updateTransactionHistory();
        })
        .catch(error => alert("Failed to sync: " + error));
    }

    updateTransactionHistory();
});

function stopScanning() {
    document.getElementById("qrScanner").style.display = "none";
}
