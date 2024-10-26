# EmailSuggestions

Chrome Extension for Writing Gmail Suggestions
Powered by OpenAI's ChatGPT

Steps to use:
1. Download repo

2. Replace "YOURAPIKEY" in responseGenerator.js with your OpenAI APIKey. (Line 9)
   Replace "YOUR_FULL_NAME" with your preferred name. (Line 10)

```javascript
const apiKey = "YOURAPIKEY"; // Replace with your actual API key
const user = "YOUR_FULL_NAME"; // Replace with your full name
```

To get API key:
https://platform.openai.com/api-keys

4. Navigate to chrome://extensions/

5. Click load unpacked and drop in the EmailSuggestions Repo from your local machine

6. Navigate to gmail, click on an email thread and use the extension's "gather context" to begin generating responses.

7. Type "!outline!" to print out a response.

![Example Usage](https://github.com/user-attachments/assets/488c82b5-7652-43db-a235-27bfa3ac6eee)

Other Commands: <br>
!outline.short! - Short template. <br>
!outline.long! <br>
!outline.formal! - Formal template. <br>
!outline.informal! <br>
!outline.short.formal! or any combination of the above.  <br>
!outline: SOME_SPECIAL_INSTRUCTION!<br>
(Where SOME_SPECIAL_INSTRUCTION provides additional instructions on outline preferences.)

![Screen Recording 2024-10-26 at 1 13 56 PM](https://github.com/user-attachments/assets/dbd844d6-acb3-4e29-bcd7-721aa13ab002)






