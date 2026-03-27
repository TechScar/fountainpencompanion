import Honeybadger from "@honeybadger-io/js";

const apiKey = document.querySelector('meta[name="honeybadger-api-key"]')?.content;
const environment = document.querySelector('meta[name="honeybadger-environment"]')?.content;
const revision = document.querySelector('meta[name="honeybadger-revision"]')?.content;

if (apiKey) {
  Honeybadger.configure({
    apiKey,
    environment: environment || "production",
    revision,
    enableUncaught: false
  });

  Honeybadger.beforeNotify((notice) => {
    // Ignore errors from browser extensions
    if (
      notice.backtrace &&
      notice.backtrace.every(
        (frame) =>
          /^(chrome|moz|safari)-extension:\/\//.test(frame.file) ||
          frame.file === "webkit-masked-url://hidden/"
      )
    ) {
      return false;
    }

    // Ignore generic unhandled promise rejections with no useful info
    if (
      notice.message === "UnhandledPromiseRejectionWarning: Unspecified reason" ||
      notice.message === "UnhandledPromiseRejectionWarning: {}"
    ) {
      return false;
    }

    return true;
  });
}

export default Honeybadger;
