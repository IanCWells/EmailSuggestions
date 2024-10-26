// Helper function to get the active tab using async/await
export async function getActiveTab() {
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
export async function executeScriptAsync(tabId, func) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      { target: { tabId }, function: func },
      (results) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(results?.[0]?.result ?? null);
        }
      }
    );
  });
}

export async function executeScriptAsyncWithArgs(tabId, func, ...args) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      { target: { tabId }, function: func, args },
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
