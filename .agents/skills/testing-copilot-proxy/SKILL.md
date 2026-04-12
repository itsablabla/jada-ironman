# Testing: Copilot Proxy on Garza OS

How to test the self-hosted sim-copilot-proxy (OpenRouter) on a white-labeled Sim Studio instance.

## Devin Secrets Needed

- `RAILWAY_API_KEY` — Railway API token for inspecting service status and logs
- OpenRouter API key (set as `OPENROUTER_API_KEY` env var on the proxy service in Railway)

## Architecture Overview

The Copilot chat flow:
1. User types in textarea on Home page (`/workspace/{id}/home`)
2. Browser sends POST to `/api/mothership/chat` on the Sim server
3. Sim server forwards to the proxy via `SIM_AGENT_API_URL` env var
4. Proxy calls OpenRouter with the configured model (e.g., `qwen/qwen3.5-plus-02-15`)
5. Proxy streams SSE events back → Sim server transforms and forwards to browser
6. Browser renders response in chat UI

### Key SSE Event Types
- `start` — stream begins
- `chat_id` — chat identifier (triggers URL change to `/task/{chatId}`)
- `content` — response text chunks
- `reasoning` — model thinking/reasoning text
- `done` — stream complete
- `error` — error occurred

## Pre-Test Verification

### 1. Check proxy health
```bash
curl https://<proxy-url>/health
```
Expect: `{"status":"ok","version":"2.0.0",...}`

### 2. Check Railway service status
Use Railway API to verify all 6 services are running:
- simstudio, realtime, redis, sim-worker, pgvector, sim-copilot-proxy

### 3. Verify SIM_AGENT_API_URL points to proxy
The simstudio service's `SIM_AGENT_API_URL` env var must point to the proxy's Railway URL, NOT `https://www.copilot.sim.ai`.

## Browser Testing: React Textarea Workaround

The Sim Studio Home page uses a React-controlled `<textarea>` for chat input. The browser tool's `type` action sets the DOM value but does NOT trigger React's synthetic event system, so the send button stays disabled.

### Working approach: Use browser console with InputEvent
```javascript
// Step 1: Set value via native setter
const textarea = document.querySelector('textarea');
textarea.focus();
const text = 'Your message here';
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype, 'value'
).set;
nativeInputValueSetter.call(textarea, text);

// Step 2: Dispatch InputEvent to trigger React state update
const inputEvent = new InputEvent('input', {
  bubbles: true, cancelable: false,
  inputType: 'insertText', data: text
});
textarea.dispatchEvent(inputEvent);
```

After this, the send button becomes enabled (no `disabled` attribute). Click it via the browser tool's `click` action using its `devinid`.

### Alternative: Playwright via CDP
If CDP is available at `http://localhost:29229`, Playwright's `textarea.fill()` method properly triggers React state updates. However, CDP may not always be available on the VM.

## Test Assertions

### Primary Flow (Test 1)
1. Send button enables after text input
2. Assistant response bubble appears within 60 seconds
3. Response contains expected factual content (e.g., "Paris" for a capital question)
4. No error toast ("Copilot backend error") appears
5. URL changes from `/home` to `/task/{uuid}` (proves `chat_id` SSE event was received)

### Chat Persistence (Test 2)
1. New task entry appears in sidebar under "All tasks"
2. Task has an LLM-generated title (not raw user input)

### Proxy Verification (Test 3)
Ask "What AI model are you?" — if the response says "Claude", the proxy might not be working and requests may be falling through to `copilot.sim.ai`. The proxy routes through OpenRouter, so the response should NOT self-identify as Claude.

## Known Cosmetic Issues

- **Reasoning text appears inline**: The proxy sends `phase:"thinking"` but the browser expects `phase:"start"`/`phase:"end"` boundary markers. Reasoning content renders as plain text instead of in a collapsible thinking block. This is cosmetic only.
- **request_id format mismatch**: Proxy sends `{data: {requestId}}` but browser expects a string. Only affects logging, not user-facing behavior.

## Troubleshooting

- **"Copilot backend error (404)"**: Check that the proxy has the `/api/mothership` endpoint. This was added in PR #1.
- **No response / timeout**: Check Railway logs for the proxy service. Common causes: OpenRouter API key invalid, model not available, proxy crashed.
- **Redis errors in simstudio logs**: Redis connectivity issues block many features. Verify Redis is running and `REDIS_URL` is correct on simstudio, realtime, and sim-worker services.
- **Send button stays disabled**: The React textarea workaround above was not applied, or the InputEvent didn't bubble correctly. Reload the page and try again.
