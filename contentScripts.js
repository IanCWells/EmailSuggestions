// Function to click the "Expand All" button
export async function clickExpandAll() {
  const expandButtons = document.querySelectorAll("div.pYTkkf-JX-ano");
  if (expandButtons.length > 2) {
    expandButtons[0].click();
  }
}

// Function to scrape email content
export function scrapeEmailContent() {
  const emailBody = document.querySelectorAll(".ii.gt");
  let emailText = [];

  emailBody.forEach((body) => {
    if (body.innerText) {
      emailText.push(body.innerText.trim());
    }
  });

  const scrapedContent = emailText.join("\n");
  if (scrapedContent.length === 0) {
    console.error("Error: No email content was found during scraping.");
  }
  return scrapedContent;
}
