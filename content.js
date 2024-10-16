// Log to ensure the content script is running
console.log("Content script running on Gmail page");

// Function to simulate clicking the "Expand all" button and wait until emails expand
async function clickExpandAll() {
  return new Promise((resolve) => {
    const expandButton = document.querySelector("div.pYTkkf-JX-ano");

    if (expandButton) {
      expandButton.click();
      console.log("Expand all button clicked!");
      // Wait for 3 seconds for emails to expand, then resolve
      setTimeout(() => {
        console.log("Emails should now be expanded, ready to scrape.");
        resolve(); // Proceed to scraping after delay
      }, 3000); // Adjust the timeout if needed
    } else {
      console.log(
        "Expand all button not found, proceeding to scrape email content."
      );
      resolve(); // No expand button, proceed immediately to scraping
    }
  });
}

// Function to scrape email content after expanding
function scrapeEmailContent() {
  let emailBody = document.querySelectorAll(".ii.gt");
  let emailText = [];

  emailBody.forEach((body) => {
    if (body.innerText) {
      emailText.push(body.innerText.trim()); // Collect the email text and trim spaces
    }
  });

  const scrapedContent = emailText.join("\n");
  console.log("Extracted Email Content:", scrapedContent);

  if (scrapedContent.length === 0) {
    console.error("Error: No email content was found during scraping.");
  }

  return scrapedContent;
}

// Function to generate an email response using OpenAI's API
async function generateEmailResponse(emailContent) {
  const apiKey = "sk-SECRET"; // Replace this with your correct OpenAI API key

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
            content: `Generate a professional email response to the following email:\n\n${emailContent}`,
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

// Function to scrape email and generate a response
async function scrapeEmailContentAndGenerateResponse() {
  // Scrape the email content
  const emailContent = scrapeEmailContent();

  if (emailContent) {
    // Generate a response using OpenAI API
    const generatedResponse = await generateEmailResponse(emailContent);

    if (!generatedResponse) {
      console.error("Error: Failed to generate a response using OpenAI API.");
    }

    return generatedResponse;
  } else {
    console.error("Error: No email content to generate response from.");
    return null;
  }
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "extractEmail") {
    try {
      // Wait for the "Expand all" process to complete before proceeding
      await clickExpandAll(); // Wait until the expand process is done

      // Then scrape and generate the email response
      const generatedResponse = await scrapeEmailContentAndGenerateResponse();

      if (generatedResponse) {
        sendResponse({ emailContent: generatedResponse });
      } else {
        console.error("Error: Generated email content is null.");
        sendResponse({ emailContent: "Error generating email content." });
      }
    } catch (error) {
      console.error("Error in content script:", error);
      sendResponse({ emailContent: `Error: ${error.message}` });
    }

    // Ensure the port stays open for the async response
    return true;
  }

  return true; // Keeps the channel open for async response
});
