import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver-types';

export interface AviSymbol extends CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  hoverText: string;
}

export const AVI_BUILTINS: AviSymbol[] = [
    {
      "label": "if",
      "kind": 14,
      "insertTextFormat": 2,
      "insertText": "if (${1:condition}) {\n\t$0\n}",
      "documentation": "Conditional branch",
      "hoverText": "### `if` Statement\nDefines a conditional execution block. The condition must evaluate to a `bool`. If `true`, the subsequent block is executed.\n\n**Usage:**\n```avi\nif x > 0 {\n    print(\"Positive\")\n}\n```"
    },
    {
      "label": "else if",
      "kind": 14,
      "insertTextFormat": 2,
      "insertText": "else if (${1:condition}) {\n\t$0\n}",
      "documentation": "Alternative If branch",
      "hoverText": "### `else if` Statement\nProvides an additional condition to check if the preceding `if` or `else if` conditions were `false`."
    },
    {
      "label": "else",
      "kind": 14,
      "insertTextFormat": 2,
      "insertText": "else {\n\t$0\n}",
      "documentation": "Alternative branch",
      "hoverText": "### `else` Statement\nThe default branch. Executes if all preceding `if` and `else if` conditions in the chain evaluate to `false`."
    },
    {
      "label": "for",
      "kind": 14,
      "insertTextFormat": 2,
      "insertText": "for ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++ {\n\t$0\n}",
      "documentation": "For loop",
      "hoverText": "### `for` Loop\nA standard C-style loop for iteration. Consists of an initializer, a condition, and an incrementer.\n\n**Example:**\n`for i = 0; i < 10; i++ { ... }`"
    },
    {
      "label": "loop",
      "kind": 14,
      "insertTextFormat": 2,
      "insertText": "loop {\n\t$0\n}",
      "documentation": "Infinite loop",
      "hoverText": "### `loop` Statement\nCreates an infinite loop. Use `break` to exit the loop or `return` to exit the function entirely."
    },
    {
      "label": "return",
      "kind": 14,
      "insertTextFormat": 2,
      "insertText": "return $0",
      "documentation": "Return from function",
      "hoverText": "### `return` Statement\nExits the current function immediately. Can optionally pass back a value to the caller."
    },
    {
      "label": "fn",
      "kind": 14,
      "insertTextFormat": 2,
      "insertText": "fn ${1:name}(${2:args}) {\n\t$0\n}",
      "documentation": "Defines a new function",
      "hoverText": "### `fn` Keyword\nUsed to declare a new function. Functions in Avi support named arguments via the `__` syntax and can return any type."
    },
    {
      "label": "mut",
      "kind": 25,
      "documentation": "Mutable variable",
      "hoverText": "### `mut` Keyword\nDeclares a variable as mutable. In Avi, variables are immutable by default. You must use `mut` to allow an array or variable to be modified in place."
    },
    {
      "label": "bool",
      "kind": 25,
      "documentation": "Boolean type",
      "hoverText": "### `bool` Type\nA logical type representing `true` or `false`."
    },
    {
      "label": "f64",
      "kind": 25,
      "documentation": "64-bit floating point",
      "hoverText": "### `f64` Type\nA double-precision 64-bit IEEE 754 floating point number."
    },
    {
      "label": "str",
      "kind": 3,
      "detail": "(var) -> str",
      "documentation": "Variable to string",
      "hoverText": "### `str(var)`\nGeneral purpose conversion: turns any Avi variable into its string representation."
    },
    {
      "label": "any",
      "kind": 25,
      "documentation": "Any type",
      "hoverText": "### `any` Type\nA dynamic type that can hold any Avi value. Useful for generic collections."
    },
    {
      "label": "vec4",
      "kind": 25,
      "documentation": "4D vector type",
      "hoverText": "### `vec4` Type\nA high-performance 4-component vector (x, y, z, w). Often used for positions or colors."
    },
    {
      "label": "mat4",
      "kind": 25,
      "documentation": "4x4 matrix type",
      "hoverText": "### `mat4` Type\nA 4x4 transformation matrix used primarily for 3D graphics and linear algebra."
    },
    {
      "label": "opt",
      "kind": 25,
      "documentation": "Optional type",
      "hoverText": "### `opt` Type\nRepresents an optional value: either `some(x)` or `none()`."
    },
    {
      "label": "res",
      "kind": 25,
      "documentation": "Result type",
      "hoverText": "### `res` Type\nRepresents an operation that could fail: either `ok(x)` or `err(e)`."
    },
    {
      "label": "link",
      "kind": 25,
      "documentation": "Linked list type",
      "hoverText": "### `link` Type\nA functional linked list structure used for recursive data patterns."
    },
    {
      "label": "sec",
      "kind": 25,
      "documentation": "Secret/traced type",
      "hoverText": "### `sec` Type\nA 'Secret' or traced type. Wraps a value and tracks its origin for logic explanations (used with `why` and `where`)."
    },
    {
      "label": "thr",
      "kind": 25,
      "documentation": "Thread type",
      "hoverText": "### `thr` Type\nA handle to a spawned thread, used to join or wait for background tasks."
    },
    {
      "label": "in",
      "kind": 25,
      "documentation": "Input channel type",
      "hoverText": "### `in` Type\nAn input channel handle for receiving messages between threads."
    },
    {
      "label": "true",
      "kind": 12,
      "documentation": "Boolean true value",
      "hoverText": "### `true` Literal\nThe boolean positive value."
    },
    {
      "label": "false",
      "kind": 12,
      "documentation": "Boolean false value",
      "hoverText": "### `false` Literal\nThe boolean negative value."
    },
    {
      "label": "why",
      "kind": 3,
      "detail": "(var: sec[bool]) -> [any]",
      "documentation": "Returns derived information for truth value",
      "hoverText": "### `why(var)`\nExtracts the explanation trail from a `sec[bool]`. This is used to understand *why* a certain search or logic condition was met."
    },
    {
      "label": "where",
      "kind": 3,
      "detail": "(var: sec[f64]) -> [any]",
      "documentation": "Returns derived information for value",
      "hoverText": "### `where(var)`\nReturns the trace data for a `sec[f64]`. Used to identify which index or condition resulted in a min/max value during a loop."
    },
    {
      "label": "explain_why",
      "kind": 3,
      "detail": "(var: bool, msg) -> sec[bool]",
      "documentation": "Adds message to derived information",
      "hoverText": "### `explain_why(var, msg)`\nAttaches a custom string message to a boolean, converting it into a `sec[bool]` for tracing."
    },
    {
      "label": "explain_where",
      "kind": 3,
      "detail": "(var: f64, msg) -> sec[f64]",
      "documentation": "Adds message to derived information",
      "hoverText": "### `explain_where(var, msg)`\nAttaches a custom string message to a number, converting it into a `sec[f64]` for tracing."
    },
    {
      "label": "print",
      "kind": 3,
      "detail": "(var)",
      "documentation": "Prints variable to stdout",
      "hoverText": "### `print(var)`\nOutputs the variable's string representation to the standard output stream."
    },
    {
      "label": "println",
      "kind": 3,
      "detail": "(var)",
      "documentation": "Prints variable to stdout with newline",
      "hoverText": "### `println(var)`\nOutputs the variable to stdout and appends a newline character."
    },
    {
      "label": "eprint",
      "kind": 3,
      "detail": "(var)",
      "documentation": "Prints variable to stderr",
      "hoverText": "### `eprint(var)`\nOutputs the variable to the standard error stream."
    },
    {
      "label": "eprintln",
      "kind": 3,
      "detail": "(var)",
      "documentation": "Prints variable to stderr with newline",
      "hoverText": "### `eprintln(var)`\nOutputs the variable to stderr and appends a newline character."
    },
    {
      "label": "read_line",
      "kind": 3,
      "detail": "() -> str",
      "documentation": "Reads a line from stdin",
      "hoverText": "### `read_line()`\nBlocks execution and waits for a line of text from the user via stdin."
    },
    {
      "label": "read_number",
      "kind": 3,
      "detail": "(message: str) -> f64",
      "documentation": "Reads a number from stdin",
      "hoverText": "### `read_number(message)`\nDisplays the message and waits for user input. If the input is not a valid number, it re-prompts the user automatically."
    },
    {
      "label": "clone",
      "kind": 3,
      "detail": "(var) -> any",
      "documentation": "Clones variable",
      "hoverText": "### `clone(var)`\nCreates a deep copy of the variable. Necessary because many types in Avi follow reference semantics."
    },
    {
      "label": "debug",
      "kind": 3,
      "detail": "()",
      "documentation": "Prints stack state",
      "hoverText": "### `debug()`\nInternal developer utility. Dumps the current state of the local and global stacks to the console."
    },
    {
      "label": "backtrace",
      "kind": 3,
      "detail": "()",
      "documentation": "Prints call stack",
      "hoverText": "### `backtrace()`\nPrints the current function call sequence to help locate where an execution path came from."
    },
    {
      "label": "typeof",
      "kind": 3,
      "detail": "(var) -> str",
      "documentation": "Returns type description",
      "hoverText": "### `typeof(var)`\nReturns a string representing the type of the value (e.g., \"f64\", \"str\", \"vec4\")."
    },
    {
      "label": "sleep",
      "kind": 3,
      "detail": "(seconds: f64)",
      "documentation": "Sleeps for seconds",
      "hoverText": "### `sleep(seconds)`\nSuspends the current thread for the specified duration."
    },
    {
      "label": "random",
      "kind": 3,
      "detail": "() -> f64",
      "documentation": "Returns random number",
      "hoverText": "### `random()`\nGenerates a pseudo-random floating point number between 0.0 and 1.0."
    },
    {
      "label": "is_empty",
      "kind": 3,
      "detail": "(l: link) -> bool",
      "documentation": "Checks if link is empty",
      "hoverText": "### `is_empty(link)`\nReturns `true` if the linked list has no elements."
    },
    {
      "label": "head",
      "kind": 3,
      "detail": "(l: link) -> opt[any]",
      "documentation": "Returns first item",
      "hoverText": "### `head(link)`\nReturns `some(first_item)` if the link is not empty, otherwise `none()`."
    },
    {
      "label": "tail",
      "kind": 3,
      "detail": "(l: link) -> link",
      "documentation": "Returns link except first",
      "hoverText": "### `tail(link)`\nReturns a new link containing all elements except the first one."
    },
    {
      "label": "tip",
      "kind": 3,
      "detail": "(l: link) -> opt[any]",
      "documentation": "Returns last item",
      "hoverText": "### `tip(link)`\nReturns the very last element of the linked list wrapped in `some()`."
    },
    {
      "label": "neck",
      "kind": 3,
      "detail": "(l: link) -> link",
      "documentation": "Returns link except last",
      "hoverText": "### `neck(link)`\nReturns a new link containing all elements except the last one."
    },
    {
      "label": "len",
      "kind": 3,
      "detail": "(array: [any]) -> f64",
      "documentation": "Returns length",
      "hoverText": "### `len(array)`\nReturns the number of elements in an array."
    },
    {
      "label": "push",
      "kind": 3,
      "detail": "(mut array, item)",
      "documentation": "Appends deep clone",
      "hoverText": "### `push(mut array, item)`\nClones the `item` and appends it to the end of the `array`. Requires the array to be `mut`."
    },
    {
      "label": "push_ref",
      "kind": 3,
      "detail": "(mut array, item)",
      "documentation": "Appends reference",
      "hoverText": "### `push_ref(mut array, item)`\nAppends the `item` by reference to the `array`. Useful for large objects to avoid cloning overhead."
    },
    {
      "label": "pop",
      "kind": 3,
      "detail": "(mut array) -> any",
      "documentation": "Removes/returns last",
      "hoverText": "### `pop(mut array)`\nRemoves the last element from the array and returns it."
    },
    {
      "label": "insert",
      "kind": 3,
      "detail": "(mut array, index, item)",
      "documentation": "Inserts clone",
      "hoverText": "### `insert(mut array, index, item)`\nInserts a deep clone of the `item` at the specified `index`."
    },
    {
      "label": "insert_ref",
      "kind": 3,
      "detail": "(mut array, index, item)",
      "documentation": "Inserts reference",
      "hoverText": "### `insert_ref(mut array, index, item)`\nInserts a reference to the `item` at the specified `index`."
    },
    {
      "label": "remove",
      "kind": 3,
      "detail": "(mut array, index) -> any",
      "documentation": "Removes at index",
      "hoverText": "### `remove(mut array, index)`\nRemoves the element at `index` and returns it."
    },
    {
      "label": "reverse",
      "kind": 3,
      "detail": "(mut array)",
      "documentation": "Reverses array",
      "hoverText": "### `reverse(mut array)`\nInverts the order of elements in the array."
    },
    {
      "label": "clear",
      "kind": 3,
      "detail": "(mut array)",
      "documentation": "Clears array",
      "hoverText": "### `clear(mut array)`\nRemoves all elements from the array, leaving its length at 0."
    },
    {
      "label": "swap",
      "kind": 3,
      "detail": "(mut array, i, j)",
      "documentation": "Swaps items",
      "hoverText": "### `swap(mut array, i, j)`\nSwaps the elements at indices `i` and `j`."
    },
    {
      "label": "str",
      "kind": 3,
      "detail": "(var) -> str",
      "documentation": "Variable to string",
      "hoverText": "### `str(var)`\nGeneral purpose conversion: turns any Avi variable into its string representation."
    },
    {
      "label": "trim",
      "kind": 3,
      "detail": "(text: str) -> str",
      "documentation": "Trims whitespace",
      "hoverText": "### `trim(text)`\nReturns a new string with whitespace removed from both start and end."
    },
    {
      "label": "trim_left",
      "kind": 3,
      "detail": "(text: str) -> str",
      "documentation": "Trims left",
      "hoverText": "### `trim_left(text)`\nRemoves leading whitespace."
    },
    {
      "label": "trim_right",
      "kind": 3,
      "detail": "(text: str) -> str",
      "documentation": "Trims right",
      "hoverText": "### `trim_right(text)`\nRemoves trailing whitespace."
    },
    {
      "label": "chars",
      "kind": 3,
      "detail": "(text: str) -> [str]",
      "documentation": "String to characters",
      "hoverText": "### `chars(text)`\nSplits a string into an array of individual character strings."
    },
    {
      "label": "parse_number",
      "kind": 3,
      "detail": "(text: str) -> opt[f64]",
      "documentation": "Parses string to number",
      "hoverText": "### `parse_number(text)`\nAttempts to parse a string as an `f64`. Returns `some(number)` or `none()` on failure."
    },
    {
      "label": "json_string",
      "kind": 3,
      "detail": "(text: str) -> str",
      "documentation": "JSON string escape",
      "hoverText": "### `json_string(text)`\nEscapes a string so it is valid inside a JSON object or array."
    },
    {
      "label": "fmt__tab_string",
      "kind": 3,
      "detail": "(tab: f64, text: str) -> str",
      "documentation": "Formats text with newlines and tab shifts using spaces",
      "hoverText": "### `fmt__tab_string` (Named Arguments)\nFormats a string by applying indentation levels.\n\n**Arguments:**\n1. `tab`: The number of space-characters to use for the indentation shift.\n2. `string`: The raw text content to be formatted."
    },
    {
      "label": "errstr__string_start_len_msg",
      "kind": 3,
      "detail": "(text: str, start: f64, len: f64, msg: str) -> str",
      "documentation": "Generates error message string with source location",
      "hoverText": "### `errstr__string_start_len_msg` (Named Arguments)\nGenerates a formatted error string that visually points to a code snippet.\n\n**Arguments:**\n1. `string`: The full source code text.\n2. `start`: The character index where the error begins.\n3. `len`: The length of the erroneous code segment to highlight.\n4. `msg`: The descriptive error message to display."
    },
    {
      "label": "abs",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns absolute value",
      "hoverText": "### `abs(v)`\nReturns the absolute (positive) value of a number."
    },
    {
      "label": "round",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Rounds number to nearest integer",
      "hoverText": "### `round(v)`\nRounds the input to the nearest whole number."
    },
    {
      "label": "floor",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns highest smaller integer",
      "hoverText": "### `floor(v)`\nRounds the number down to the nearest integer."
    },
    {
      "label": "ceil",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns smallest higher integer",
      "hoverText": "### `ceil(v)`\nRounds the number up to the nearest integer."
    },
    {
      "label": "sqrt",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns square root",
      "hoverText": "### `sqrt(v)`\nCalculates the square root of the provided value."
    },
    {
      "label": "sin",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns sine of number",
      "hoverText": "### `sin(v)`\nCalculates the sine of an angle (in radians)."
    },
    {
      "label": "asin",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns inverse sine",
      "hoverText": "### `asin(v)`\nCalculates the arcsine (inverse sine) in radians."
    },
    {
      "label": "cos",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns cosine of number",
      "hoverText": "### `cos(v)`\nCalculates the cosine of an angle (in radians)."
    },
    {
      "label": "acos",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns inverse cosine",
      "hoverText": "### `acos(v)`\nCalculates the arccosine (inverse cosine) in radians."
    },
    {
      "label": "tan",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns tangent in radians",
      "hoverText": "### `tan(v)`\nCalculates the tangent of an angle (in radians)."
    },
    {
      "label": "atan",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns inverse tangent in radians",
      "hoverText": "### `atan(v)`\nCalculates the arctangent in radians."
    },
    {
      "label": "atan2",
      "kind": 3,
      "detail": "(y: f64, x: f64) -> f64",
      "documentation": "Returns inverse tangent in radians",
      "hoverText": "### `atan2(y, x)`\nReturns the multi-quadrant arctangent of y/x."
    },
    {
      "label": "exp",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns natural exponential (e^x)",
      "hoverText": "### `exp(v)`\nCalculates the value of $e^v$."
    },
    {
      "label": "ln",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns natural logarithm",
      "hoverText": "### `ln(v)`\nCalculates the natural logarithm (base $e$)."
    },
    {
      "label": "log2",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns logarithm base 2",
      "hoverText": "### `log2(v)`\nCalculates the logarithm with base 2."
    },
    {
      "label": "log10",
      "kind": 3,
      "detail": "(v: f64) -> f64",
      "documentation": "Returns logarithm base 10",
      "hoverText": "### `log10(v)`\nCalculates the logarithm with base 10."
    },
    {
      "label": "min",
      "kind": 3,
      "detail": "(array: [f64]) -> f64",
      "documentation": "Returns smallest number in array",
      "hoverText": "### `min(array)`\nIterates through an array to find the minimum value. Returns `NaN` if empty."
    },
    {
      "label": "max",
      "kind": 3,
      "detail": "(array: [f64]) -> f64",
      "documentation": "Returns largest number in array",
      "hoverText": "### `max(array)`\nIterates through an array to find the maximum value. Returns `NaN` if empty."
    },
    {
      "label": "is_nan",
      "kind": 3,
      "detail": "(v: f64) -> bool",
      "documentation": "Returns true if number is NaN",
      "hoverText": "### `is_nan(v)`\nChecks if a number is the special 'Not-a-Number' value."
    },
    {
      "label": "tau",
      "kind": 3,
      "detail": "() -> f64",
      "documentation": "Returns radians in a circle (2*pi)",
      "hoverText": "### `tau()`\nReturns the constant $2pi$ (approximately 6.28318)."
    },
    {
      "label": "norm",
      "kind": 3,
      "detail": "(v: vec4) -> f64",
      "documentation": "Returns length of 4D vector",
      "hoverText": "### `norm(v)`\nCalculates the Euclidean magnitude/length of a `vec4`."
    },
    {
      "label": "dot",
      "kind": 3,
      "detail": "(a, b) -> f64",
      "documentation": "Returns dot product",
      "hoverText": "### `dot(a, b)`\nCalculates the scalar dot product of two vectors."
    },
    {
      "label": "cross",
      "kind": 3,
      "detail": "(a: vec4, b: vec4) -> vec4",
      "documentation": "Returns cross product",
      "hoverText": "### `cross(a, b)`\nCalculates the 3D cross product of the first three components of two vectors."
    },
    {
      "label": "x",
      "kind": 3,
      "detail": "(v: vec4) -> f64",
      "documentation": "Returns x component",
      "hoverText": "### `x(v)`\nExtracts the first component from a `vec4`."
    },
    {
      "label": "y",
      "kind": 3,
      "detail": "(v: vec4) -> f64",
      "documentation": "Returns y component",
      "hoverText": "### `y(v)`\nExtracts the second component from a `vec4`."
    },
    {
      "label": "z",
      "kind": 3,
      "detail": "(v: vec4) -> f64",
      "documentation": "Returns z component",
      "hoverText": "### `z(v)`\nExtracts the third component from a `vec4`."
    },
    {
      "label": "w",
      "kind": 3,
      "detail": "(v: vec4) -> f64",
      "documentation": "Returns w component",
      "hoverText": "### `w(v)`\nExtracts the fourth component from a `vec4`."
    },
    {
      "label": "s",
      "kind": 3,
      "detail": "(v: vec4, ind: f64) -> f64",
      "documentation": "Returns component by index",
      "hoverText": "### `s(v, index)`\nAccesses a `vec4` component by index (0-3)."
    },
    {
      "label": "dir__angle",
      "kind": 3,
      "detail": "(angle: f64) -> vec4",
      "documentation": "Returns unit vector at angle",
      "hoverText": "### `dir__angle` (Named Arguments)\nCreates a unit vector from a rotation.\n\n**Arguments:**\n1. `angle`: The rotation in radians from the (1,0) basis on the XY plane."
    },
    {
      "label": "rx",
      "kind": 3,
      "detail": "(m: mat4) -> vec4",
      "documentation": "Returns row vector x",
      "hoverText": "### `rx(m)`\nGets the first row vector of a 4x4 matrix."
    },
    {
      "label": "ry",
      "kind": 3,
      "detail": "(m: mat4) -> vec4",
      "documentation": "Returns row vector y",
      "hoverText": "### `ry(m)`\nGets the second row vector of a 4x4 matrix."
    },
    {
      "label": "rz",
      "kind": 3,
      "detail": "(m: mat4) -> vec4",
      "documentation": "Returns row vector z",
      "hoverText": "### `rz(m)`\nGets the third row vector of a 4x4 matrix."
    },
    {
      "label": "rw",
      "kind": 3,
      "detail": "(m: mat4) -> vec4",
      "documentation": "Returns row vector w",
      "hoverText": "### `rw(m)`\nGets the fourth row vector of a 4x4 matrix."
    },
    {
      "label": "rv",
      "kind": 3,
      "detail": "(m: mat4, ind: f64) -> vec4",
      "documentation": "Returns row vector by index",
      "hoverText": "### `rv(m, index)`\nGets a matrix row by index (0-3)."
    },
    {
      "label": "cx",
      "kind": 3,
      "detail": "(m: mat4) -> vec4",
      "documentation": "Returns column vector x",
      "hoverText": "### `cx(m)`\nGets the first column vector of a 4x4 matrix."
    },
    {
      "label": "cy",
      "kind": 3,
      "detail": "(m: mat4) -> vec4",
      "documentation": "Returns column vector y",
      "hoverText": "### `cy(m)`\nGets the second column vector of a 4x4 matrix."
    },
    {
      "label": "cz",
      "kind": 3,
      "detail": "(m: mat4) -> vec4",
      "documentation": "Returns column vector z",
      "hoverText": "### `cz(m)`\nGets the third column vector of a 4x4 matrix."
    },
    {
      "label": "cv",
      "kind": 3,
      "detail": "(m: mat4, ind: f64) -> vec4",
      "documentation": "Returns column vector by index",
      "hoverText": "### `cv(m, index)`\nGets a matrix column by index (0-3)."
    },
    {
      "label": "det",
      "kind": 3,
      "detail": "(m: mat4) -> f64",
      "documentation": "Returns determinant",
      "hoverText": "### `det(m)`\nCalculates the determinant of the 4x4 matrix."
    },
    {
      "label": "inv",
      "kind": 3,
      "detail": "(m: mat4) -> mat4",
      "documentation": "Returns inverse",
      "hoverText": "### `inv(m)`\nCalculates the inverse of the 4x4 matrix."
    },
    {
      "label": "mov",
      "kind": 3,
      "detail": "(v: vec4) -> mat4",
      "documentation": "Returns translation matrix",
      "hoverText": "### `mov(v)`\nCreates a translation matrix using the x, y, z components of `v`."
    },
    {
      "label": "rot__axis_angle",
      "kind": 3,
      "detail": "(axis: vec4, angle: f64) -> mat4",
      "documentation": "Returns rotation matrix",
      "hoverText": "### `rot__axis_angle` (Named Arguments)\nCreates a rotation matrix.\n\n**Arguments:**\n1. `axis`: The `vec4` axis of rotation.\n2. `angle`: The rotation amount in radians."
    },
    {
      "label": "ortho__pos_right_up_forward",
      "kind": 3,
      "detail": "(pos, right, up, forward) -> mat4",
      "documentation": "Returns orthogonal view matrix",
      "hoverText": "### `ortho__pos_right_up_forward` (Named Arguments)\nCreates a view matrix from camera components.\n\n**Arguments:**\n1. `pos`: Camera position.\n2. `right`: Right vector.\n3. `up`: Up vector.\n4. `forward`: Forward vector."
    },
    {
      "label": "proj__fov_near_far_ar",
      "kind": 3,
      "detail": "(fov, near, far, ar) -> mat4",
      "documentation": "Returns projection matrix",
      "hoverText": "### `proj__fov_near_far_ar` (Named Arguments)\nCreates a perspective projection matrix.\n\n**Arguments:**\n1. `fov`: Field of view.\n2. `near`: Near clip plane.\n3. `far`: Far clip plane.\n4. `ar`: Aspect ratio."
    },
    {
      "label": "mvp__model_view_projection",
      "kind": 3,
      "detail": "(model, view, projection) -> mat4",
      "documentation": "Returns MVP matrix",
      "hoverText": "### `mvp__model_view_projection` (Named Arguments)\nCalculates the final Model-View-Projection matrix.\n\n**Arguments:**\n1. `model`: The model matrix.\n2. `view`: The view matrix.\n3. `projection`: The projection matrix."
    },
    {
      "label": "scale",
      "kind": 3,
      "detail": "(v: vec4) -> mat4",
      "documentation": "Returns scale matrix",
      "hoverText": "### `scale(v)`\nCreates a scaling matrix using the x, y, z components of `v`."
    },
    {
      "label": "str__color",
      "kind": 3,
      "detail": "(color: vec4) -> str",
      "documentation": "Returns HTML hex color string",
      "hoverText": "### `str__color` (Named Arguments)\nConverts a `vec4` to a hex string (e.g., #RRGGBB).\n\n**Arguments:**\n1. `color`: Vector containing RGBA values clamped between 0 and 1."
    },
    {
      "label": "srgb_to_linear__color",
      "kind": 3,
      "detail": "(color: vec4) -> vec4",
      "documentation": "Converts sRGB to linear color space",
      "hoverText": "### `srgb_to_linear__color` (Named Arguments)\nConverts a color from sRGB to Linear space for calculation.\n\n**Arguments:**\n1. `color`: The source sRGB vector."
    },
    {
      "label": "linear_to_srgb__color",
      "kind": 3,
      "detail": "(color: vec4) -> vec4",
      "documentation": "Converts linear to sRGB color space",
      "hoverText": "### `linear_to_srgb__color` (Named Arguments)\nConverts a color from Linear to sRGB space for display.\n\n**Arguments:**\n1. `color`: The source linear vector."
    },
    {
      "label": "none",
      "kind": 3,
      "detail": "() -> opt[any]",
      "documentation": "Creates none() option variant",
      "hoverText": "### `none()`\nReturns an empty `opt` value."
    },
    {
      "label": "some",
      "kind": 3,
      "detail": "(var) -> opt[any]",
      "documentation": "Creates some(var) option variant",
      "hoverText": "### `some(var)`\nWraps a value into an `opt`."
    },
    {
      "label": "ok",
      "kind": 3,
      "detail": "(var) -> res[any]",
      "documentation": "Creates ok(var) result variant",
      "hoverText": "### `ok(var)`\nWraps a success value into a `res`."
    },
    {
      "label": "err",
      "kind": 3,
      "detail": "(var) -> res[any]",
      "documentation": "Creates err(var) result variant",
      "hoverText": "### `err(var)`\nWraps an error value into a `res`."
    },
    {
      "label": "unwrap",
      "kind": 3,
      "detail": "(var) -> any",
      "documentation": "Unwraps value",
      "hoverText": "### `unwrap(var)`\nExtracts the inner value of a `some` or `ok`. Crashes if `none` or `err`."
    },
    {
      "label": "unwrap_err",
      "kind": 3,
      "detail": "(var) -> any",
      "documentation": "Unwraps error",
      "hoverText": "### `unwrap_err(var)`\nExtracts the inner error of an `err`. Crashes if `ok`."
    },
    {
      "label": "unwrap_or",
      "kind": 3,
      "detail": "(var, def) -> any",
      "documentation": "Unwraps value or returns default",
      "hoverText": "### `unwrap_or(var, default)`\nReturns inner value or the provided default."
    },
    {
      "label": "is_err",
      "kind": 3,
      "detail": "(var: res) -> bool",
      "documentation": "Returns true if err(x)",
      "hoverText": "### `is_err(var)`\nReturns `true` if the result is an error."
    },
    {
      "label": "is_ok",
      "kind": 3,
      "detail": "(var: res) -> bool",
      "documentation": "Returns true if ok(x)",
      "hoverText": "### `is_ok(var)`\nReturns `true` if the result is successful."
    },
    {
      "label": "load",
      "kind": 3,
      "detail": "(source: str) -> res[any]",
      "documentation": "Loads module from source file",
      "hoverText": "### `load(source)`\nLoads an Avi module from the specified file path."
    },
    {
      "label": "load__source_imports",
      "kind": 3,
      "detail": "(source: str, imports: [any]) -> res[any]",
      "documentation": "Loads module with dependencies",
      "hoverText": "### `load__source_imports` (Named Arguments)\nLoads a module from a file with specific dependency imports.\n\n**Arguments:**\n1. `source`: Path to the file.\n2. `imports`: Array of required module dependencies."
    },
    {
      "label": "module__in_string_imports",
      "kind": 3,
      "detail": "(name: str, code: str, imports: [any]) -> res[any]",
      "documentation": "Creates module from string",
      "hoverText": "### `module__in_string_imports` (Named Arguments)\nDynamically creates a module from a raw code string.\n\n**Arguments:**\n1. `name`: Internal name for the module.\n2. `string`: The code content.\n3. `imports`: Array of module dependencies."
    },
    {
      "label": "check__in_string_imports",
      "kind": 3,
      "detail": "(name: str, code: str, imports: [any]) -> res[[{}]]",
      "documentation": "Returns lifetime/type-checker data",
      "hoverText": "### `check__in_string_imports` (Named Arguments)\nRuns the type/lifetime checker on a code string.\n\n**Arguments:**\n1. `name`: Virtual filename.\n2. `string`: The code content.\n3. `imports`: Array of module dependencies."
    },
    {
      "label": "call",
      "kind": 3,
      "detail": "(module, function: str, arguments: [any])",
      "documentation": "Calls function in module",
      "hoverText": "### `call(module, function, arguments)`\nExecutes a module function without returning its value."
    },
    {
      "label": "call_ret",
      "kind": 3,
      "detail": "(module, function: str, arguments: [any]) -> any",
      "documentation": "Calls function and returns result",
      "hoverText": "### `call_ret(module, function, arguments)`\nExecutes a module function and returns the result."
    },
    {
      "label": "functions",
      "kind": 3,
      "detail": "() -> any",
      "documentation": "Returns list of available functions",
      "hoverText": "### `functions()`\nLists all globally available functions."
    },
    {
      "label": "functions__module",
      "kind": 3,
      "detail": "(module) -> any",
      "documentation": "Returns list of functions in module",
      "hoverText": "### `functions__module` (Named Arguments)\nLists functions available within a specific module.\n\n**Arguments:**\n1. `module`: The module object to inspect."
    },
    {
      "label": "has",
      "kind": 3,
      "detail": "(obj: {}, key: str) -> bool",
      "documentation": "Returns true if object has key",
      "hoverText": "### `has(obj, key)`\nChecks if a key exists within an object."
    },
    {
      "label": "keys",
      "kind": 3,
      "detail": "(obj: {}) -> [str]",
      "documentation": "Returns all keys of object",
      "hoverText": "### `keys(obj)`\nReturns an array containing all property names of the object."
    },
    {
      "label": "load_string__file",
      "kind": 3,
      "detail": "(file: str) -> res[str]",
      "documentation": "Loads string from file",
      "hoverText": "### `load_string__file` (Named Arguments)\nReads the entire content of a file as a string.\n\n**Arguments:**\n1. `file`: The path to the target file."
    },
    {
      "label": "load_string__url",
      "kind": 3,
      "detail": "(url: str) -> res[str]",
      "documentation": "Loads string from URL",
      "hoverText": "### `load_string__url` (Named Arguments)\nFetches the text content from a web URL.\n\n**Arguments:**\n1. `url`: The remote address to load from."
    },
    {
      "label": "save__string_file",
      "kind": 3,
      "detail": "(string: str, file: str) -> res[str]",
      "documentation": "Saves string to file",
      "hoverText": "### `save__string_file` (Named Arguments)\nWrites a string to a file on disk.\n\n**Arguments:**\n1. `string`: The content to save.\n2. `file`: The destination path."
    },
    {
      "label": "download__url_file",
      "kind": 3,
      "detail": "(url: str, file: str) -> res[str]",
      "documentation": "Downloads file from URL",
      "hoverText": "### `download__url_file` (Named Arguments)\nDownloads a remote file directly to a local path.\n\n**Arguments:**\n1. `url`: The source URL.\n2. `file`: The local destination path."
    },
    {
      "label": "load_data__file",
      "kind": 3,
      "detail": "(file: str) -> res[any]",
      "documentation": "Loads Dyon data from file",
      "hoverText": "### `load_data__file` (Named Arguments)\nParses structured data from a file.\n\n**Arguments:**\n1. `file`: The path to the data file."
    },
    {
      "label": "save__data_file",
      "kind": 3,
      "detail": "(data, file: str) -> res[str]",
      "documentation": "Saves Dyon data to file",
      "hoverText": "### `save__data_file` (Named Arguments)\nSerializes and saves data to a file.\n\n**Arguments:**\n1. `data`: The Avi data structure to save.\n2. `file`: The destination path."
    },
    {
      "label": "load_data__string",
      "kind": 3,
      "detail": "(string: str) -> res[any]",
      "documentation": "Loads Dyon data from string",
      "hoverText": "### `load_data__string` (Named Arguments)\nParses structured data from a raw string.\n\n**Arguments:**\n1. `string`: The raw text containing data."
    },
    {
      "label": "load__meta_file",
      "kind": 3,
      "detail": "(meta_file: str, file: str) -> res[[[any]]]",
      "documentation": "Loads meta data from file",
      "hoverText": "### `load__meta_file` (Named Arguments)\nParses a file using a Piston-Meta syntax file.\n\n**Arguments:**\n1. `meta`: The syntax rule file path.\n2. `file`: The target file path to parse."
    },
    {
      "label": "load__meta_url",
      "kind": 3,
      "detail": "(meta_file: str, url: str) -> res[[any]]",
      "documentation": "Loads meta data from URL",
      "hoverText": "### `load__meta_url` (Named Arguments)\nParses a URL response using a meta syntax file.\n\n**Arguments:**\n1. `meta`: The syntax rule file path.\n2. `url`: The remote address to parse."
    },
    {
      "label": "syntax__in_string",
      "kind": 3,
      "detail": "(name: str, text: str) -> res[any]",
      "documentation": "Parses meta syntax rules from string",
      "hoverText": "### `syntax__in_string` (Named Arguments)\nCreates meta syntax rules from a string.\n\n**Arguments:**\n1. `name`: Reference name for the syntax.\n2. `string`: The raw syntax definition text."
    },
    {
      "label": "meta__syntax_in_string",
      "kind": 3,
      "detail": "(syntax, name: str, text: str) -> res[[any]]",
      "documentation": "Parses meta data from string",
      "hoverText": "### `meta__syntax_in_string` (Named Arguments)\nApplies a pre-loaded syntax to a string of data.\n\n**Arguments:**\n1. `syntax`: The loaded syntax object.\n2. `name`: The context name.\n3. `string`: The data string to parse."
    },
    {
      "label": "json_from_meta_data",
      "kind": 3,
      "detail": "(meta_data: [[any]]) -> str",
      "documentation": "Generates JSON from meta data",
      "hoverText": "### `json_from_meta_data(meta_data)`\nConverts the complex output of meta-parsing into a standard JSON string."
    },
    {
      "label": "json_parse",
      "kind": 3,
      "detail": "(json: str) -> any",
      "documentation": "Parses JSON string",
      "hoverText": "### `json_parse(json)`\nConverts a JSON string into an Avi object/array structure."
    },
    {
      "label": "json_stringify",
      "kind": 3,
      "detail": "(data) -> str",
      "documentation": "Converts data to JSON string",
      "hoverText": "### `json_stringify(data)`\nSerializes Avi data into a JSON formatted string."
    },
    {
      "label": "join__thread",
      "kind": 3,
      "detail": "(t: thr) -> res[any]",
      "documentation": "Waits for thread to finish",
      "hoverText": "### `join__thread` (Named Arguments)\nBlocks the current execution until the specified thread completes.\n\n**Arguments:**\n1. `thread`: The thread handle to join."
    },
    {
      "label": "wait_next",
      "kind": 3,
      "detail": "(channel: in) -> opt[any]",
      "documentation": "Blocks until message received",
      "hoverText": "### `wait_next(channel)`\nBlocks the thread until a message is available on the input channel."
    },
    {
      "label": "next",
      "kind": 3,
      "detail": "(channel: in) -> opt[any]",
      "documentation": "Checks for message (non-blocking)",
      "hoverText": "### `next(channel)`\nChecks for a message on a channel without blocking. Returns `none()` if no message is ready."
    },
    {
      "label": "now",
      "kind": 3,
      "detail": "() -> f64",
      "documentation": "Returns seconds since Unix Epoch",
      "hoverText": "### `now()`\nReturns current system time in seconds."
    },
    {
      "label": "time_parse_duration",
      "kind": 3,
      "detail": "(duration: str) -> f64",
      "documentation": "Parses duration string",
      "hoverText": "### `time_parse_duration(duration)`\nConverts duration strings (like \"1h 30m\") into seconds."
    },
    {
      "label": "time_format_date",
      "kind": 3,
      "detail": "(timestamp: f64, format: str) -> str",
      "documentation": "Formats Unix timestamp as date string",
      "hoverText": "### `time_format_date(timestamp, format)`\nConverts a numeric timestamp into a readable date string using standard format tokens."
    },
    {
      "label": "crypto_hash",
      "kind": 3,
      "detail": "(algorithm: str, data: str) -> str",
      "documentation": "Computes cryptographic hash",
      "hoverText": "### `crypto_hash(algorithm, data)`\nGenerates a hash of the data using algorithms like SHA256 or MD5."
    },
    {
      "label": "crypto_hmac",
      "kind": 3,
      "detail": "(algorithm: str, key: str, data: str) -> str",
      "documentation": "Computes HMAC",
      "hoverText": "### `crypto_hmac(algorithm, key, data)`\nGenerates a keyed-hash message authentication code."
    },
    {
      "label": "get_constant",
      "kind": 3,
      "detail": "(key: str) -> any",
      "documentation": "Gets constant value by key",
      "hoverText": "### `get_constant(key)`\nRetrieves a globally defined constant."
    },
    {
      "label": "get_setting",
      "kind": 3,
      "detail": "(key: str) -> any",
      "documentation": "Gets setting value by key",
      "hoverText": "### `get_setting(key)`\nRetrieves a system or program setting value."
    },
    {
      "label": "get_setting_full",
      "kind": 3,
      "detail": "(key: str) -> any",
      "documentation": "Gets full setting information",
      "hoverText": "### `get_setting_full(key)`\nRetrieves a setting along with its metadata."
    },
    {
      "label": "locale",
      "kind": 3,
      "detail": "(key: str) -> any",
      "documentation": "Gets localized string",
      "hoverText": "### `locale(key)`\nRetrieves a string from the current translation/locale table."
    },
    {
      "label": "has_constant",
      "kind": 3,
      "detail": "(key: str) -> bool",
      "documentation": "Returns true if constant exists",
      "hoverText": "### `has_constant(key)`\nChecks if a constant is defined."
    },
    {
      "label": "has_setting",
      "kind": 3,
      "detail": "(key: str) -> bool",
      "documentation": "Returns true if setting exists",
      "hoverText": "### `has_setting(key)`\nChecks if a specific setting exists."
    },
    {
      "label": "list_locales",
      "kind": 3,
      "detail": "() -> any",
      "documentation": "Returns list of available locales",
      "hoverText": "### `list_locales()`\nReturns an array of all loaded locale identifiers."
    },
    {
      "label": "list_settings",
      "kind": 3,
      "detail": "() -> any",
      "documentation": "Returns list of all available settings",
      "hoverText": "### `list_settings()`\nReturns an array of all setting keys."
    },
    {
      "label": "list_constants",
      "kind": 3,
      "detail": "() -> any",
      "documentation": "Returns list of all available constants",
      "hoverText": "### `list_constants()`\nReturns an array of all defined constant keys."
    },
    {
      "label": "get_manifest",
      "kind": 3,
      "detail": "() -> any",
      "documentation": "Returns program manifest information",
      "hoverText": "### `get_manifest()`\nReturns an object containing program version and metadata."
    },
    {
      "label": "get_permissions",
      "kind": 3,
      "detail": "() -> any",
      "documentation": "Returns the permissions data",
      "hoverText": "### `get_permissions()`\nReturns the security and access control permissions for the current environment."
    },
    {
      "label": "is_disabled",
      "kind": 3,
      "detail": "() -> bool",
      "documentation": "Returns true if functionality is disabled",
      "hoverText": "### `is_disabled()`\nChecks if the current execution environment is in a 'disabled' or 'read-only' state."
    }
];