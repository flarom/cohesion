# Cohesion

![App screen shot](cohesion/scrshot.png)

[Launch Cohesion](https://flarom.github.io/cohesion/)
⸳
[Wiki](https://github.com/flarom/cohesion/wiki)

***

## Cohesion Markdown Support
Cohesion provides support for the following Markdown elements.

| Element               | Support | Notes |
|---                    |---      |---    |
| Headings              | Yes     |       |
| Paragraphs            | Yes     |       |
| Line Breaks           | Yes     |       |
| Bold                  | Yes     |       |
| Italic                | Yes     |       |
| Blockquotes           | Yes     | In addition to normal blockquotes, a `> [!header]` can also be inserted at the top of the quote, to create a block.
| Ordered Lists         | Yes     |       |
| Unordered Lists       | Yes     |       |
| Code                  | Yes     |       |
| Horizontal Rules      | Yes     |       |
| Links                 | Yes     |       |
| Images                | Yes     | In addition to images, audio and video can also be inserted using the image syntax.
| Tables                | Yes     |       |
| Fenced Code Blocks    | Yes     | JavaScript can be executed from the document preview.
| Syntax Highlighting   | Yes     |       |
| Footnotes             | No      |       |
| Heading IDs           | Partial | Automatically generated. There’s no way to set custom heading IDs. 
| Definition Lists      | Yes     |       |
| Strikethrough         | Yes     |       |
| Task Lists            | Yes     |       |
| Emoji (copy and paste) | Yes    |       |
| Emoji (shortcodes)    | Yes     |       |
| Highlight             | Yes     |       |
| Subscript             | Yes     |       |
| Superscript           | Yes     |       |
| Automatic URL Linking | Yes     |       |
| Disabling Automatic URL Linking | Yes  ||
| HTML                  | Yes     | Some tags like `<script>` are note available to prevent auto-run, use JavaScript codeblocks instead.

## About
Cohesion is heavily inspired by the [Apostrophe](https://apps.gnome.org/en/Apostrophe/) text editor, by [Manuel Genovés](https://gitlab.gnome.org/somas), but built for a web environment and with extra features! It uses [CodeMirror 5](https://codemirror.net/) to render syntax highlighting and [Showdownjs](https://showdownjs.com/) to parse Markdown.
