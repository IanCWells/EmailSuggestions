import {
  getActiveTab,
  executeScriptAsync,
  executeScriptAsyncWithArgs,
} from "./utils.js";

import { clickExpandAll, scrapeEmailContent } from "./contentScripts.js";
import { monitorReplyText } from "./responseGenerator.js";

window.generateFlag = true;

document.addEventListener("DOMContentLoaded", initializeExpandButtonListener);

function initializeExpandButtonListener() {
  const expandButton = document.getElementById("expandButton");
  if (expandButton) {
    expandButton.addEventListener("click", handleExpandButtonClick);
  } else {
    console.error("Element with id 'expandButton' not found.");
  }
}

async function handleExpandButtonClick() {
  try {
    let tabs = await getActiveTab();
    await executeScriptAsync(tabs[0].id, clickExpandAll);

    let scrapedContent = await executeScriptAsync(
      tabs[0].id,
      scrapeEmailContent
    );
    console.log(scrapedContent);
    if (scrapedContent === "***") {
    } else {
      const generatedResponse = "Generating Outline!";
      await executeScriptAsyncWithArgs(
        tabs[0].id,
        monitorReplyText,
        scrapedContent,
        generatedResponse
      );
    }
  } catch (error) {
    console.error("Error handling expand button click:", error);
  }
}
