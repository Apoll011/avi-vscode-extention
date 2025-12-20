# Avi DSL Language Server

Official Language Server for **Avi DSL**, the programming language used to build **skills and logic modules** for the Avi Core Node.

This Language Server integrates with **Visual Studio Code** and is built around **Dyon** as its semantic and execution backbone, ensuring that what you write in the editor behaves exactly as it will at runtime.

## Purpose

The Avi DSL LSP exists to close the gap between **editor experience** and **Core Node execution**.

It provides early validation, structural guarantees, and context-aware tooling for a DSL that is:

* deterministic,
* sandbox-friendly,
* and designed for long-running assistant logic.

If the LSP accepts it, the Avi runtime should too. That is the contract.

## Language Overview

Avi DSL is **function-oriented** and Dyon-compatible.
There are no implicit magic blocks. Execution is explicit.

Example skill:

```
fn intent_hi(intent: Intent) {
    error_str := locale(key: "light_error")
    
    if (is_eco()) {
        println(error_str)
    }
    else {
        println("Oi Tiago!")
    }
}

fn is_eco() {
    to_check := "eco"
    return get_setting("mode") == to_check
}

fn main() {
    println("Skill Loaded!")
}
```

Key characteristics:

* Dyon syntax and semantics
* Explicit `fn` declarations
* Explicit entry points (`main`, intent handlers)
* Strong separation between logic and runtime permissions

## Features

The Language Server provides Avi DSL–specific tooling:

* **Code completion**

  * `fn`, `if`, `else`, `return`
  * Built-in functions (`println`, `locale`, `get_setting`)
  * Avi runtime symbols (`Intent`, settings, environment helpers)
* **Intent-aware validation**

  * Validates intent handler signatures (`fn intent_xxx(intent: Intent)`)
  * Ensures intent handlers are callable by the Core
* **Diagnostics on change**

  * Syntax errors
  * Invalid function signatures
  * Missing `main()` entry point
  * Unknown built-ins or runtime symbols
* **Structural checks**

  * Duplicate function names
  * Invalid return paths
  * Use of undeclared variables
* **Configuration-aware revalidation**

  * Diagnostics are recomputed on file edits or configuration changes
* **End-to-End tests**

  * VS Code client ↔ LSP server

All semantic analysis is driven by **Dyon**, not a parallel or mocked interpreter.

## Project Structure

```
.
├── client                // VS Code Language Client
│   ├── src
│   │   └── extension.ts  // Client entry point
├── server                // Avi DSL Language Server
│   └── src
│       ├── server.ts     // LSP entry point
│       ├── parser        // Dyon-based parsing
│       ├── diagnostics   // Semantic and structural rules
│       └── completion    // Avi symbol definitions and completion
├── syntaxes              // TextMate grammar
├── package.json          // VS Code extension manifest
└── README.md
```

## Technology Stack

* **VS Code Language Server Protocol**
* **TypeScript**
* **Dyon**
* Architecture aligned with:

  * Avi Core Node
  * AECP
  * Avi skill runtime model

Below is a **single, clean TODO.md roadmap** you can drop straight into your repo.
It’s ordered **from easiest → hardest**, grounded in **what you already implemented** in the shown files, and aligned with **LSP 3.17**.
Checked items reflect what your current server *actually does*, not what it merely declares.

---

# Avi DSL – Language Server Roadmap (LSP 3.17)

## Phase 0 — Foundation (Already in place)

* [x] LSP server bootstrap (`createConnection`)
* [x] Workspace folder detection
* [x] Graceful handling of missing workspace
* [x] Full document sync (`TextDocumentSyncKind.Full`)
* [x] Document store via `TextDocuments`
* [x] Basic completion provider
* [x] Completion resolve hook
* [x] Diagnostics endpoint (stub, empty)
* [x] Server lifecycle (`onInitialize`, `onInitialized`, `listen`)
* [x] Modular completion architecture (providers)

---

## Phase 1 — Diagnostics & Stability

Goal: Make errors visible and trustworthy.

* [ ] Real diagnostics (syntax errors)
* [ ] Semantic diagnostics (invalid intents, missing fields)
* [ ] Range-accurate diagnostics
* [ ] Severity levels (Error / Warning / Info)
* [ ] Diagnostic codes & sources (`avi-dsl`)
* [ ] Incremental diagnostics updates
* [ ] Clear diagnostics on file close
* [ ] Project-wide validation trigger

---

## Phase 2 — Smarter Completions

Goal: Make completions feel “alive”.

* [x] Built-in keyword completions
* [x] Scope-based completions
* [x] Current-file symbol completions
* [x] Config-based completions
* [ ] Context-aware completions (AST-driven)
* [ ] Snippet completions
* [ ] Completion item kinds (Function, Keyword, Variable)
* [ ] Sorting & filtering (`sortText`, `filterText`)
* [ ] Trigger characters
* [ ] Commit characters
* [ ] Documentation markdown support
* [ ] Completion per node type (intent, fn, locale, config)

---

## Phase 3 — Hover & Help

Goal: Explain the language inline.

* [ ] Hover provider
* [ ] Hover for functions
* [ ] Hover for intents
* [ ] Hover for keywords
* [ ] Markdown hover formatting
* [ ] Signature preview on hover
* [ ] Link to docs/spec from hover

---

## Phase 4 — Symbols & Navigation

Goal: Let users move through code effortlessly.

* [ ] Document symbols (`textDocument/documentSymbol`)
* [ ] Symbol kinds (Function, Variable, Namespace)
* [ ] Workspace symbols
* [x] Go to definition
* [x] Go to declaration
* [ ] Find references
* [ ] Peek definition support

---

### Phase 5 — Formatting & Edits

Goal: Enforce a consistent style.

* [x] Document formatting
* [ ] Document formatting
* [ ] Range formatting
* [ ] On-type formatting
* [ ] Indentation rules
* [ ] Whitespace normalization
* [ ] Comment formatting
* [ ] Formatter config support

---

### Phase 6 — Rename & Refactors

Goal: Safe, mechanical transformations.

* [ ] Rename provider
* [ ] Rename validation
* [ ] Cross-file rename
* [ ] Prepare rename
* [ ] Safe intent renaming
* [ ] Function refactor support
* [ ] Config key refactors

---

### Phase 7 — Semantic Intelligence

Goal: Make the language *understood*, not guessed.

* [ ] Full AST parser
* [ ] Incremental parsing
* [ ] Symbol table
* [ ] Scope resolution
* [ ] Type inference (Intent, String, Bool, etc.)
* [ ] Semantic diagnostics
* [ ] Dead code detection
* [ ] Unused symbol detection

---

### Phase 8 — Semantic Tokens

Goal: True syntax highlighting.

* [ ] Semantic tokens provider
* [ ] Token types (function, keyword, variable)
* [ ] Token modifiers
* [ ] Incremental semantic tokens
* [ ] Theme compatibility testing

---

### Phase 9 — Workspace Intelligence

Goal: Treat the project as a system.

* [ ] Multi-file intent resolution
* [ ] Cross-file diagnostics
* [ ] Dependency graph
* [ ] Skill auto-discovery
* [ ] Workspace-wide validation
* [ ] Config hot-reload
* [ ] File watching integration

---

### Phase 10 — Tooling & UX

Goal: Professional developer experience.

* [ ] Code actions (quick fixes)
* [ ] Auto-imports
* [ ] Refactor previews
* [ ] Inline hints (inlay hints)
* [ ] Custom commands
* [ ] Progress reporting
* [ ] Telemetry hooks (optional)
* [ ] Performance profiling

## Running the Project

1. Install dependencies:

```
npm install
```

2. Open the folder in VS Code.

3. Start compilation in watch mode:

```
Ctrl + Shift + B
```

4. Open **Run and Debug** (`Ctrl + Shift + D`).

5. Select **Launch Client**.

6. Press **F5**.

This launches an **Extension Development Host** with the Avi DSL extension enabled.

## Trying It Out

In the Extension Development Host:

1. Open a file with a supported Avi DSL extension.
2. Start typing a skill:

```
fn main() {
    println("Hello Avi")
}
```

You should immediately get:

* syntax highlighting,
* function and symbol completion,
* real-time diagnostics if something violates the Avi/Dyon model.

## Design Principles

This LSP is intentionally strict.

* No silent fallbacks
* No editor/runtime mismatch
* No DSL ambiguity

The language is simple on purpose. The tooling enforces that simplicity.

## Project Status

* Actively developed
* Grammar and diagnostics evolving alongside the DSL
* Semantic tokens, hover docs, and static analysis planned