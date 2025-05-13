# Markdown tutorial for Cohesion

This is a complete and friendly guide to creating Markdown documents, both outside and inside Cohesion! Whether you're writing notes, documentation, blog posts or cute lists of things you love, Markdown makes everything simpler and more readable.

## Index
- [Markdown tutorial for Cohesion](#markdown-tutorial-for-cohesion)
    - [Index](#index)
    - [Markdown cheat sheet](#markdown-cheat-sheet)
    - [Headings](#headings)
    - [Paragraphs](#paragraphs)
    - [Block quotations](#block-quotations)
    - [Code](#code)
    - [Lists](#lists)
        - [Bullet List:](#bullet-list)
        - [Nested Lists:](#nested-lists)
        - [Numbered Lists:](#numbered-lists)
    - [Links](#links)
        - [Inline links](#inline-links)
    - [Images](#images)
    - [Math](#math)
        - [MathML cheat sheet](#mathml-cheat-sheet)


## Markdown cheat sheet
| Element			| Markdown syntax						| Keyboard shortcut	|
|---				|---									|---				|
| Heading			| `# H1`<br>`## H2`<br>`### H3`			| Ctrl+1 to Ctrl+6	|
| Bold				| `**Bold text**`						| Ctrl+B			|
| Italic			| `*italicized text*`					| Ctrl+I			|
| Blockquote		| `> blockquote`						|					|
| Ordered list		| `1. First item`<br>`2. Seccond item`	|					|
| Unordered list	| `- First item`<br>`- Seccond item`	| Ctrl+U			|
| Code				| `` `Code` ``							|					|
| Horizontal rule	| `***` or `---`						| Ctrl+R			|
| Link				| `[title](example.com)`				|					|
| Image				| `![alt text](image.png)`				|					|
| Task list			| `- [ ] Item`<br>`- [x] Checked item`	|					|

## Headings
Headings (or titles) are used to organize content by breaking it into clear sections. They help readers understand the structure of your document and make it easier to scan for information.

Use headings to:
- Separate major sections
- Introduce topics or categories
- Structure longer documents or guides

In Markdown, you create headings using the `#` symbol. The number of `#` symbols you use determines the level of the heading:
```markdown
# Title 1
## Title 2
### Title 3
#### Title 4
##### Title 5
###### Title 6
```

Alternatively, you can underline your heading with `===` or `---` to create level 1 and level 2 headings:
```markdown
Title 1
=======

Title 2
-------
```

## Paragraphs
A paragraph is one or more lines of text followed by one or more blank line. Newlines are treated as spaces. If you need a hard line break, put two or more spaces at the end of a line, or type a backslash at the end of a line.

## Block quotations
Block quotes are used to highlight quoted text, such as a phrase from a book, article, or someone you’re referencing. They help give visual emphasis and make the quote stand out from the rest of the content:

```
> "The journey of a thousand miles begins with one step." — Lao Tzu
```

You can also make multi-line quotes like this:
```
> This is a longer quote  
> that spans multiple lines.  
> You can keep adding `>` for each new line.
```

You can nest a quote inside another by adding more `>`:
```
> This is a quote.
>
>> This is a nested quote!
```

## Code
Code blocks are used to display code or command-line text in a clean, readable way. 

To include a small piece of code inside a sentence, wrap it with backticks ( ` ):
```
Use the `console.log()` function to show output.
```

To show multiple lines of code, use three backticks (```) before and after the code:
````
```
a = function() {
	return 0;
}
```
````

You can identify the language of your code block by putting the language name right after the first three backticks:

````
```javascript
a = function() {
	return 0;
}
```
````

## Lists

### Bullet List:

```markdown
* Cat
* Dog
* Fox
```

### Nested Lists:

```markdown
* Games
  * RPG
    - Final Fantasy
    - Undertale
```

### Numbered Lists:

```
1. Wake up
2. Drink tea
3. Be cute 😽
```

## Links
Links are used to display, reference or note web adresses. Enclosing an URL in pointy brackets transforms them into links:

`<https://example.com>` = <https://example.com>,  
`<user@host.com>` = <user@host.com>.

### Inline links

You can also give a title to the link by writing a title in brackets and the URL in parentheses:

`[Example](https://example.com)` = [Example](https://example.com).

## Images

Images are used to display graphics from the internet in your document.

An image can be inserted by creating a link and adding a `!` prefix.

```markdown
![Alt text](https://host/image.png)

![Gif of Kasane Teto, the popular vocal synthsizer, dancing with a cute face](https://media1.tenor.com/m/Z_jHYKTiYFAAAAAC/kasane-teto.gif)
```

![Gif of Kasane Teto, the popular vocal synthsizer, dancing with a cute face](https://media1.tenor.com/m/Z_jHYKTiYFAAAAAC/kasane-teto.gif)

Note that you can link files from your device by placing the file path instead of an URL, but the file will not be included with the markdown document and can not be shown in the browser version of Cohesion nor any other text editor.

## Math

You can insert math using MathML — Mathematical Markup Language — an XML-based language that allows mathematical notation to be written and displayed in HTML documents.

To begin using MathML, wrap all math content inside a `<math>` element. Inside the `<math>` tag, you can use different child elements to represent numbers, operators, variables, fractions, roots, powers, and more.

For example, to represent a simple addition like 2 + 3, you can use `<mn>2</mn>`, `<mo>+</mo>`, and `<mn>3</mn>`, wrapped in a `<mrow>` tag which groups these items in a horizontal layout:

```mathml
<math>
  <mrow>
    <mn>2</mn>
    <mo>+</mo>
    <mn>3</mn>
  </mrow>
</math>
```
<math>
  <mrow>
    <mn>2</mn>
    <mo>+</mo>
    <mn>3</mn>
  </mrow>
</math>

The `<mn>` tag is used for numbers, `<mo>` for operators like `+`, `-`, `=` etc., and `<mrow>` acts like a container that holds math expressions in a row. To write a fraction like a/b, use the `<mfrac>` element, where the first child is the numerator and the second is the denominator:

```mathml
<math>
  <mfrac>
    <mi>a</mi>
    <mi>b</mi>
  </mfrac>
</math>
```
<math>
  <mfrac>
    <mi>a</mi>
    <mi>b</mi>
  </mfrac>
</math>

Here, `<mi>` is used to denote an identifier, typically a single variable like "a" or "b". To write powers, like x squared, use the `<msup>` tag with the base as the first child and the exponent as the second:

```mathml
<math>
  <msup>
    <mi>x</mi>
    <mn>2</mn>
  </msup>
</math>
```
<math>
  <msup>
    <mi>x</mi>
    <mn>2</mn>
  </msup>
</math>

If you want to write a square root, you can use the `<msqrt>` tag, and place the content under the root inside it, like this:

```mathml
<math>
  <msqrt>
    <mi>x</mi>
  </msqrt>
</math>
```
<math>
  <msqrt>
    <mi>x</mi>
  </msqrt>
</math>

For more complex expressions, you can combine elements. For instance, the Pythagorean identity `x² + y² = z²` can be written by nesting multiple <msup> elements inside a single <mrow> to group them properly:

```mathml
<math>
  <mrow>
    <msup><mi>x</mi><mn>2</mn></msup>
    <mo>+</mo>
    <msup><mi>y</mi><mn>2</mn></msup>
    <mo>=</mo>
    <msup><mi>z</mi><mn>2</mn></msup>
  </mrow>
</math>
```
<math>
  <mrow>
    <msup><mi>x</mi><mn>2</mn></msup>
    <mo>+</mo>
    <msup><mi>y</mi><mn>2</mn></msup>
    <mo>=</mo>
    <msup><mi>z</mi><mn>2</mn></msup>
  </mrow>
</math>

### MathML cheat sheet

| Purpose        | Tag       | Example      							    |
|---             |---        |---                                           |
| Number         | `<mn>`    | `<mn>5</mn>`                                 |
| Variable 		 | `<mi>`    | `<mi>x</mi>`                                 |
| Operator 		 | `<mo>`    | `<mo>+</mo>` 								|
| Group in a row | `<mrow>`  | `<mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow>`|
| Fraction       | `<mfrac>` | `<mfrac><mi>a</mi><mi>b</mi></mfrac>`        |
| Square Root    | `<msqrt>` | `<msqrt><mi>x</mi></msqrt>`                  |
| Root (n-th)    | `<mroot>` | `<mroot><mi>x</mi><mn>3</mn></mroot>`        |
| Power          | `<msup>`  | `<msup><mi>x</mi><mn>2</mn></msup>`          |
| Subscript      | `<msub>`  | `<msub><mi>a</mi><mn>1</mn></msub>`			|
| Sub and Superscript|`<msubsup>`|`<msubsup><mi></mi><mn>1</mn><mn>2</mn></msubsup>`|
| Text           | `<mtext>` | `<mtext>Hello</mtext>`                       |
| Parentheses (auto sized)|`<mo stretchy="true">`|`<mo>(</mo>x+1<mo>)</mo>` |
| Matrix | `<mtable>`, `<mtr>`, `<mtd>` | `<mtable>`<br>`<mtr><mtd>1</mtd><mtd>2</mtd></mtr>`<br>`<mtr><mtd>3</mtd><mtd>4</mtd></mtr>`<br>`</mtable>`|