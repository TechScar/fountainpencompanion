import Honeybadger from "@honeybadger-io/js";

const apiKey = document.querySelector('meta[name="honeybadger-api-key"]')?.content;
const environment = document.querySelector('meta[name="honeybadger-environment"]')?.content;
const revision = document.querySelector('meta[name="honeybadger-revision"]')?.content;

if (apiKey) {
  Honeybadger.configure({
    apiKey,
    environment: environment || "production",
    revision
  });
}

export default Honeybadger;
