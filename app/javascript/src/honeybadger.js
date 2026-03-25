import Honeybadger from "@honeybadger-io/js";

const apiKey = document.querySelector('meta[name="honeybadger-api-key"]')?.content;
const environment = document.querySelector('meta[name="honeybadger-environment"]')?.content;

if (apiKey) {
  Honeybadger.configure({
    apiKey,
    environment: environment || "production"
  });
}

export default Honeybadger;
