document.addEventListener("DOMContentLoaded", () => {
  const expandButton = document.getElementById("expandButton");

  if (expandButton) {
    expandButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log("Active tab URL:", tabs[0].url);

        if (tabs[0].url.includes("mail.google.com")) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "extractEmail" },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Content script error:",
                  chrome.runtime.lastError.message
                );
              } else if (response && response.emailContent) {
                const emailContentDiv = document.getElementById("emailContent");
                emailContentDiv.innerText = response.emailContent;
                console.log("Generated email content:", response.emailContent);
              } else {
                console.error(
                  "Error: Response email content is undefined or empty."
                );
              }
            }
          );
        } else {
          console.error("The current tab is not Gmail.");
        }
      });
    });
  }
});
