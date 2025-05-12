# Markdown tutorial for Cohesion

This is a quick guide into creating Markdown documents, outside and inside of Cohesion

## Index
- [Markdown cheat sheet](#markdown-cheat-sheet)
- [Headings](#headings)
- [Paragraphs](#paragraphs)
- [Block quotations](#block-quotations)
- [Code](#code)
- [Lists](#lists)
	- [Bullet list](#bullet-list)
	- [Nested lists](#nested-lists)
	- [Numbered lists](#numbered-lists)

## Markdown cheat sheet
| Element			| Markdown syntax						| Keyboard shortcut	|
|---				|---									|---				|
| Heading			| `# H1`<br>`## H2`<br>`### H3`			| Ctrl+1/6			|
| Bold				| `**Bold text**`						| Ctrl+B			|
| Italic			| `*italicized text*`					| Ctrl+I			|
| Blockquote		| `> blockquote`						|					|
| Ordered list		| `1. First item`<br>`2. Seccond item`	|					|
| Unordered list	| `- First item`<br>`- Seccond item`	| Ctrl+U			|
| Code				| `` `Code` ``							|					|
| Horizontal rule	| `***`									| Ctrl+R			|
| Link				| `[title](example.com)`				|					|
| Image				| `![alt text](image.png)`				|					|

## Headings
Headings (or titles) are used to organize content by breaking it into clear sections. They help readers understand the structure of your document and make it easier to scan for information.

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

> This is a block quote.

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

* one
* two
* three

### Nested Lists:

* fruits
	+ pears
	+ peaches
* vegetables
	+ broccoli
	+ ubuntu
		- mint
		- lubuntu
		- kubuntu

### Numbered Lists:

1. Item 1
2. Item 2
3. Item 3

## Links
Links are used to display, reference or note web adresses. The simples way to insert a functional link is to wrap the URL with < and >:

`<https://example.com>` will result in <https://example.com>.

You can also give a title to the link by writing the URL in parentheses:

`(Example)[https://example.com]` will result in [Example](https://example.com) .
