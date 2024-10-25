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
  const generatedResponse =
    "Generating Outline!"; /*await generateEmailResponse(
    scrapedContent,
    "short",
    "formal"
  );
  console.log("Generated Email Response:", generatedResponse);*/

  // Pass the generated response to monitorReplyText and execute it in the content script
  await executeScriptAsyncWithArgs(
    tabs[0].id,
    monitorReplyText,
    scrapedContent,
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
async function monitorReplyText(scrapedContent) {
  //Defining this function locally may not be best practice - but is the quick fix I found to only generate after Outline....
  async function generateEmailResponse(emailContent, responseType, formalType) {
    const apiKey = "YOURAPIKEY"; // Replace with your actual API key

    const instructions = {
      short: "Be brief in your response.  Under 100 words.", // Short response
      long: "Respond in more detail if the context requires. However, do not be overly verbose or repetitive. Write with clarity.", // Long response
    };
    const formality = {
      informal: "Write more informally and personally.",
      formal: "Write more professionally.",
    };

    // Select the appropriate token limit based on the responseType
    const m_instructions = instructions[responseType] || ""; // Default to nothing if not defined
    const m_formal = formality[formalType] || ""; // Default to nothing if not defined

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
                content: `You are Ian Wells. Based on the provided email context, generate an appropriate email response to the following. ${m_instructions} ${m_formal}:\n\n${emailContent}`,
              },
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        }
      );

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

  let responseInserted = false;
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        // Look for the reply area that was added to the DOM
        const replyArea = document.querySelector("[contenteditable='true']");

        if (replyArea) {
          console.log("Reply area detected:", replyArea);

          // Asynchronous function to handle input event
          const handleInput = async () => {
            const replyText = replyArea.innerText.trim();
            if (replyText === "") {
              responseInserted = false;
            }
            if (replyText.toLowerCase() === "!outline!" && !responseInserted) {
              responseInserted = true;
              replyArea.innerText = "Generating Outline....";
              console.log("Outline detected. Generating response...");

              // Call the generateEmailResponse function to get the generated response

              const generatedResponse = await generateEmailResponse(
                scrapedContent,
                "short" // You can change this to "short", "medium", or "long" based on the need
              );

              // Insert the generated email response into the reply area

              replyArea.innerText = generatedResponse;

              console.log("Generated response inserted:", generatedResponse);
            }

            console.log("Current reply text:", replyText);
          };

          // Add event listener for 'input' on the replyArea
          replyArea.addEventListener("input", handleInput);
        }
      }
    });
  });

  // Start observing the DOM for changes
  observer.observe(document.body, { childList: true, subtree: true });
}
