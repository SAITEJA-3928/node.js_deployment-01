
const connectBtn = document.getElementById("connectBtn");
const responseText = document.getElementById("response");
const statusText = document.getElementById("status");

connectBtn.addEventListener("click", async () => {
    responseText.textContent = "Connecting...";
    statusText.textContent = "Status: Connecting to backend...";

    try {
        const response = await fetch("/api");

        if (!response.ok) {
            throw new Error("HTTP error: " + response.status);
        }

        const message = await response.text();

        responseText.textContent = message;
        statusText.textContent = "Status: Connected successfully";
    } catch (error) {
        responseText.textContent = "Unable to connect to backend.";
        statusText.textContent = "Status: Connection failed";
        console.error(error);
    }
});
