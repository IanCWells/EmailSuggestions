document.getElementById("expandButton").addEventListener("click", async () => {
  const tabs = await getActiveTab();

  // First execute the expand function
  await executeScriptAsync(tabs[0].id, clickExpandAll);

  // Then execute the email scraping function after expansion
  const scrapedContent = await executeScriptAsync(
    tabs[0].id,
    scrapeEmailContent
  );
  console.log("Scraped Content:", scrapedContent);

  // Generate the email response asynchronously
  const generatedResponse = await generateEmailResponse(scrapedContent);
  console.log("Generated Email Response:", generatedResponse);

  // Pass the generated response to monitorReplyText and execute it in the content script
  await executeScriptAsyncWithArgs(
    tabs[0].id,
    monitorReplyText,
    generatedResponse
  );
});

// Helper function to get the active tab using async/await
async function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs);
      }
    });
  });
}

// Helper function to execute script asynchronously
async function executeScriptAsync(tabId, func) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        function: func,
      },
      (results) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          if (
            results &&
            results.length > 0 &&
            results[0].result !== undefined
          ) {
            resolve(results[0].result); // Resolve the returned result
          } else {
            resolve(null); // If no result, resolve with null
          }
        }
      }
    );
  });
}

async function executeScriptAsyncWithArgs(tabId, func, ...args) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        function: func,
        args: args, // Pass the arguments to the function
      },
      (results) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(results);
        }
      }
    );
  });
}

async function clickExpandAll() {
  return new Promise((resolve) => {
    const expandButtons = document.querySelectorAll("div.pYTkkf-JX-ano");
    if (expandButtons.length > 2) {
      expandButtons[0].click();
      resolve();
    } else {
      resolve();
    }
  });
}

function scrapeEmailContent() {
  let emailBody = document.querySelectorAll(".ii.gt");
  let emailText = [];

  emailBody.forEach((body) => {
    if (body.innerText) {
      emailText.push(body.innerText.trim()); // Collect the email text and trim spaces
    }
  });

  const scrapedContent = emailText.join("\n");
  console.log("Extracted Email Content!");

  if (scrapedContent.length === 0) {
    console.error("Error: No email content was found during scraping.");
  }
  return scrapedContent;
}

// Modified monitorReplyText to accept the generated response
function monitorReplyText(generatedResponse) {
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        // Look for the reply area that was added to the DOM
        const replyArea = document.querySelector("[contenteditable='true']");

        if (replyArea) {
          console.log("Reply area detected:", replyArea);

          // Listen for changes in the reply text area
          replyArea.addEventListener("input", () => {
            const replyText = replyArea.innerText.trim();
            if (replyText === "!outline!" || replyText === "!Outline!") {
              console.log("Success");
              // Insert the generated email response into the reply area
              replyArea.innerText = generatedResponse;
            }
            console.log("Current reply text:", replyText);
          });
        }
      }
    });
  });

  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);

  console.log("Monitoring reply button click and reply text area...");
}

// Function to generate an email response using OpenAI's GPT model
async function generateEmailResponse(emailContent) {
  const apiKey = "sk-YOURAPIKEY"; // Replace with your actual API key

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an email assistant. Please generate a professional email response based on the provided context.",
          },
          {
            role: "user",
            content: `You are Ian Wells. Based on the provided email context, generate an appropriate email response to the following:\n\n${emailContent}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const generatedResponse = data.choices[0].message.content;
      console.log("Generated Email Response:", generatedResponse);
      return generatedResponse;
    } else {
      console.error("Error: No response from OpenAI API.");
      return null;
    }
  } catch (error) {
    console.error("Error during API call:", error);
    return null;
  }
}
