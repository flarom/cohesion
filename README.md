# Cohesion

![App screen shot](res/scrshot.png)

[Launch Cohesion](https://flarom.github.io/cohesion/)
⸳
[Get Cohesion Desktop](https://github.com/flarom/cohesion/releases/tag/v1.0.0)
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
| Syntax Highlighting   | No      |       |
| Footnotes             | No      |       |
| Heading IDs           | Partial | Automatically generated. There’s no way to set custom heading IDs. 
| Definition Lists      | No      |       |
| Strikethrough         | Yes     |       |
| Task Lists            | Yes     | In addition to checked and unchecked items, partially completed items and cancelled items are also available.
| Emoji (copy and paste) | Yes    |       |
| Emoji (shortcodes)    | Yes     |       |
| Highlight             | No      | HTML tag only.
| Subscript             | No      | HTML tag only.
| Superscript           | No      | HTML tag only.
| Automatic URL Linking | Yes     |       |
| Disabling Automatic URL Linking | Yes  ||
| HTML                  | Yes     | Some tags like `<script>` are note available to prevent auto-run, use JavaScript codeblocks instead.

***
## About
Cohesion is heavily inspired by the [Apostrophe](https://apps.gnome.org/en/Apostrophe/) text editor, by [Manuel Genovés](https://gitlab.gnome.org/somas), but built for a web environment and with extra features! It uses [CodeMirror 5](https://codemirror.net/) to render syntax highlighting and [Showdownjs](https://showdownjs.com/) to parse Markdown.

## Useful resources
- [Cohesion Markdown Tutorial](https://flarom.github.io/cohesion/read.html?path=tutorial.md)
- [GitHub Markdown Guide](https://docs.github.com/articles/markdown-basics)
