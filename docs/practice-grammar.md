# Practice Corner checks

LanguageTool is the only active grammar provider. The local rule engine is retained as inactive code; Next, Submit and the student interface never invoke it. Vocabulary-presence checks still enforce using the target word, independently of grammar.

Next checks the current sentence. A clean response flashes a green SVG tick for 700ms and advances once. Findings open a modal with an X symbol, original writing, explanations and replacement options. The student edits manually and checks again or skips. Escape and Edit return to the writing field. Skipped sentences keep their drafts, are excluded from submission checks, and are not graded. The last sentence stays available for Submit.

Submit reuses unchanged per-user LanguageTool cache entries; modified sentences are checked again. Story mode submits the passage once. Provider failure, timeout or rate limit never produces a tick or grade. Editing, changing variants and navigation invalidate outstanding UI results. Changing variants clears accepted sentences.

Public endpoint: https://api.languagetool.org/v2/check. Its public usage policy prohibits automated requests and provides no availability guarantee. Requests here follow explicit Next/Submit actions; that does not establish production permission from the provider. Self-hosting remains the supported option for automated workloads.

The provider module limits each process to eight outbound requests/40KB per minute, coalesces identical calls and caches results for five minutes. Multiple instances share no limiter, so upstream 429s remain possible. No background retries. The UI discloses text transfer and links attribution/privacy. No API key required.

Run npm run test:grammar and npm run build for the active flow. tests/local-grammar.cjs and tests/grammar-robustness.cjs describe the retired local-flow contract and are not the active regression commands. Neither no issues nor a green tick certifies meaning or perfect English.
