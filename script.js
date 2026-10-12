"use strict";

document.addEventListener("DOMContentLoaded", function () {
    var connectBtn = document.getElementById("connectBtn");
    var responseText = document.getElementById("response");
    var statusText = document.getElementById("status");

    if (!connectBtn || !responseText || !statusText) {
        console.error("Required HTML elements are missing.");
        return;
    }

    connectBtn.addEventListener("click", async function () {
        responseText.textContent = "Connecting...";
        statusText.textContent = "Status: Connecting to backend...";

        try {
            var response = await fetch("/api");

            if (!response.ok) {
                throw new Error("HTTP error: " + response.status);
            }

            var message = await response.text();

            responseText.textContent = message;
            statusText.textContent = "Status: Connected successfully";
        } catch (error) {
            responseText.textContent = "Unable to connect to backend.";
            statusText.textContent = "Status: Connection failed";
            console.error("Backend connection error:", error);
        }
    });
});