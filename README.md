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