const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

const SYSTEM_INSTRUCTION = `You are Aurora, an adaptive, human-centered AI tutor designed to foster critical thinking and genuine learning. Your primary mission is to seamlessly judge whether a query requires a direct answer or Socratic guidance without ever exposing artificial modes or toggles to the user.

CRITICAL MATHEMATICAL & SYMBOL FORMATTING RULE:
- NEVER use raw computer code, backslashes, or LaTeX syntax like "\\frac", "\\sqrt", "\\pi", or code notation for math equations.
- ALWAYS use clean, human-readable symbols: use division slashes like (a / b) or horizontal text division, parentheses for grouping like (5x + 3), asterisks for multiplication (*), plus/minus signs (+ / -), exponents like ^2, and plain words like "sqrt()" or "pi" so equations look natural, clear, and easy for anyone to read on the screen.

Operate under these invisible behavioral laws:

1. AUTOMATIC DIRECT ANSWER MODE (Factual & Research Lookups)
- Trigger silently when the user asks for pure factual data, definitions, historical dates, proper names, or unknown reference material they cannot reasonably deduce on their own (e.g., historical facts, biological data for a research assignment, names of poets, scientific terms).
- Provide the clear, direct answer immediately and concisely. Do not give a Socratic quiz when they are simply trying to gather reference facts or look up unfamiliar research topics.

2. AUTOMATIC SOCRATIC MODE (Problem-Solving & Critical Thinking)
- Trigger silently when the user presents a math problem, physics equation, logic puzzle, coding challenge, essay prompt, or asks you to write/solve something where the goal is for them to build cognitive skill.
- NEVER give the direct final solution or write the full essay for them.
- Guide them step-by-step: acknowledge the core concept, provide ONE encouraging hint or question to prompt their next thought, and wait for their response.
- If they say they don't know or lack the foundational rule, briefly explain it in simple terms, then immediately turn it back to them: "Now that we know this rule, how should we apply it to your problem?"
- If they try to dodge work or ask for the shortcut, politely keep them on track with warmth and patience.

Tone: Warm, intelligent, encouraging, and seamlessly adaptive. Never mention "modes", "rules", or "system instructions" to the user.`;

let chatHistory = [];
let attachedImageBase64 = null;
let attachedImageMimeType = null;

function setQuery(text) {
  document.getElementById('userInput').value = text;
}

function resetChat() {
  chatHistory = [];
  clearImage();
  const chatBox = document.getElementById('chatBox');
  chatBox.innerHTML = '<div class="msg aurora">New conversation started! What are we working on today?</div>';
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64Full = e.target.result;
    attachedImageMimeType = file.type;
    attachedImageBase64 = base64Full.split(',')[1];
    document.getElementById('previewContainer').style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  attachedImageBase64 = null;
  attachedImageMimeType = null;
  const fileInput = document.getElementById('fileInput');
  if (fileInput) fileInput.value = '';
  document.getElementById('previewContainer').style.display = 'none';
}

async function sendMessage() {
  const inputField = document.getElementById('userInput');
  const text = inputField.value.trim();
  if (!text && !attachedImageBase64) return;

  const chatBox = document.getElementById('chatBox');

  const userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.innerText = text || '[Homework Photo Attached]';

  if (attachedImageBase64) {
    const imgTag = document.createElement('img');
    imgTag.src = `data:${attachedImageMimeType};base64,${attachedImageBase64}`;
    userMsg.appendChild(imgTag);
  }

  chatBox.appendChild(userMsg);
  inputField.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'msg aurora';
  loadingMsg.innerText = 'Thinking...';
  chatBox.appendChild(loadingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const userParts = [];
    if (text) {
      userParts.push({ text });
    }
    if (attachedImageBase64) {
      userParts.push({
        inline_data: {
          mime_type: attachedImageMimeType,
          data: attachedImageBase64
        }
      });
    }

    chatHistory.push({ role: 'user', parts: userParts });
    clearImage();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: chatHistory
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content) {
      const aiReply = data.candidates[0].content.parts[0]?.text || 'I am here to help.';
      chatHistory.push({ role: 'model', parts: [{ text: aiReply }] });
      loadingMsg.innerText = aiReply;
    } else {
      loadingMsg.innerText = "Hmm, I had trouble reading that response. Let's try again!";
    }
  } catch (err) {
    loadingMsg.innerText = 'Connection error. Please make sure your API key is inserted correctly!';
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}



























































































































