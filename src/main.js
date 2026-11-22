import "./style.css";
import { createHandshakeClient } from "api-handshake";

const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const client = createHandshakeClient({
  baseURL: apiBaseURL,
  expectedVersion: "1.0.0",
  timeout: 5000,
  credentials: "omit",
  verbose: true
});

const button = document.querySelector("#run-check");
const title = document.querySelector("#connection-title");
const message = document.querySelector("#connection-message");
const indicator = document.querySelector("#connection-indicator");
const checksContainer = document.querySelector("#checks");
const duration = document.querySelector("#duration");

const labels = {
  backend: "Backend reachability",
  cors: "CORS visibility",
  apiVersion: "API version",
  credentials: "Credentials configuration"
};

function renderChecks(checks) {
  checksContainer.innerHTML = "";

  for (const [key, check] of Object.entries(checks)) {
    const card = document.createElement("article");
    card.className = "check-card";

    const top = document.createElement("div");
    top.className = "check-top";

    const name = document.createElement("h4");
    name.textContent = labels[key] || key;

    const status = document.createElement("span");
    status.className = `status status-${check.status}`;
    status.textContent = check.status;

    const description = document.createElement("p");
    description.textContent = check.message;

    top.append(name, status);
    card.append(top, description);

    if (check.details && Object.keys(check.details).length > 0) {
      const detail = document.createElement("pre");
      detail.textContent = JSON.stringify(check.details, null, 2);
      card.append(detail);
    }

    checksContainer.append(card);
  }
}

button.addEventListener("click", async () => {
  button.disabled = true;
  button.textContent = "Checking…";
  title.textContent = "Checking connection";
  message.textContent = `Testing ${apiBaseURL}`;
  indicator.className = "indicator loading";

  try {
    const result = await client.check();
    const failed = Object.values(result.checks).some(
      (check) => check.status === "failed"
    );

    title.textContent = result.connected ? "Connection healthy" : "Connection needs attention";
    message.textContent = result.connected
      ? "The handshake completed and no blocking diagnostic failures were found."
      : "The handshake found a connectivity or configuration problem. Review the checks below.";
    indicator.className = `indicator ${result.connected ? "success" : "failure"}`;
    duration.textContent = `${result.duration} ms`;
    renderChecks(result.checks);
  } catch (error) {
    title.textContent = "Diagnostic could not run";
    message.textContent = error instanceof Error ? error.message : "Unexpected error";
    indicator.className = "indicator failure";
    checksContainer.textContent = "No diagnostic report was returned.";
  } finally {
    button.disabled = false;
    button.innerHTML = 'Run connection check <span aria-hidden="true">↗</span>';
  }
});
