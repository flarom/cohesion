# Quoting code

When writing technical documentation, tutorials, or notes, it is often necessary to include code snippets to illustrate examples, show commands, or explain specific syntax.

Quoting code in Markdown can be done in two ways, depending on the length and context of the code. For short pieces of code or inline references, you can use single backticks (\`). For example, writing `` `example()` `` will render as `example()`. This is useful when mentioning function names, variables, or short commands within a sentence.

For longer pieces of code that span multiple lines, Markdown uses fenced code blocks. These are created by enclosing the code between three backticks (` ``` `) placed on lines before and after the code. Optionally, you can specify the programming language immediately after the opening backticks to enable syntax highlighting, which improves readability and makes it easier for readers to understand the code. For example:

> [!Example]
> ```python
> def greet(name):
>     print(f"Hello, {name}!")
> ```

This will be rendered as a distinct block with formatting appropriate for Python code, making it easier for readers to understand the syntax and logic.

Additionally, when using languages like JavaScript, Cohesion allows you to execute the code directly within the preview. This is particularly useful for interactive examples. For instance:

> [!Example]
> <input type=text id=name value="Name">
> ```javascript
> let nameField = document.getElementById('name');
>
> Notify("Hello, " + nameField.value + "!");
> ```