# EmailSuggestions

Chrome Extension for Writing Quick Email Suggestions
Gmail Compatible

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

Other Commands:
!outline.short! - Short template.
!outline.long!
!outline.formal! - Formal template. 
!outline.informal!

!outline.short.formal! or any combination of the above.  

!outline: SOME_SPECIAL_INSTRUCTION!

Where SOME_SPECIAL_INSTRUCTION is provides the template additional instructions on how to create an outline.  









