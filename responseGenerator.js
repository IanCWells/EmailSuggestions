export async function monitorReplyText(scrapedContent) {
  //Defining this function locally may not be best practice - but is the quick fix I found to only generate after Outline....
  let generateFlag = false;
  async function generateEmailResponse(
    emailContent,
    responseType,
    formalType,
    instruction
  ) {
    const apiKey = "YOURAPIKEY"; // Replace with your actual API key
    const user = "YOURNAME";

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
                content: `You are ${user}. Start each email with Hi, addressed to the other entity involved with communication (NOT ${user}). End the email  with Best/Sincerely, \n ${user}.  Based on the provided email context, generate an appropriate email response to the following. ${m_instructions} ${m_formal} ${instruction}:\n\n${emailContent}`,
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
          // Helper function to insert the outline message
          const setGeneratingOutline = () => {
            responseInserted = true;
            replyArea.innerText = "Generating Outline....";
          };

          // Command map for different reply texts and response lengths
          //This needs to be updated and made more efficient
          const commandMap = {
            "!outline!": ["short", "formal"],
            "!outline.short!": ["short", "formal"],
            "!outline.long!": ["long", "formal"],
            "!outline.formal!": ["short", "formal"],
            "!outline.informal!": ["short", "informal"],
            "!outline.short.informal!": ["short", "informal"],
            "!outline.long.informal!": ["long", "informal"],
            "!outline.short.formal!": ["short", "formal"],
            "!outline.long.formal!": ["long", "formal"],
            "!outline.informal.short!": ["short", "informal"],
            "!outline.informal.long!": ["long", "informal"],
            "!outline.formal.short!": ["short", "formal"],
            "!outline.formal.long!": ["long", "formal"],
          };

          // Defaults
          let response_length = "short";
          let response_formality = "formal";
          let specialInstruction = "";
          const handleInput = async () => {
            const replyText = replyArea.innerText.trim();
            if (!replyText) {
              responseInserted = false;
            }
            const outlineRegex = /^!outline:\s*(.*)!$/i;
            const match = replyText.match(outlineRegex);
            if (
              (!responseInserted &&
                commandMap.hasOwnProperty(replyText.toLowerCase())) ||
              match
            ) {
              setGeneratingOutline();
              if (match) {
                specialInstruction = match;
              } else {
                specialInstruction = "";
                response_length = commandMap[replyText.toLowerCase()][0];
                response_formality = commandMap[replyText.toLowerCase()][1];
              }

              let generatedResponse = await generateEmailResponse(
                scrapedContent,
                response_length,
                response_formality,
                specialInstruction
              );

              replyArea.innerText = generatedResponse;
              generateFlag = true;
            }
          };
          //This should turn off when the expand button is clicked
          replyArea.addEventListener("input", handleInput);
        }
      }
    });
  });
  // Start observing the DOM for changes
  observer.observe(document.body, { childList: true, subtree: true });
}
