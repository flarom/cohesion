/*
Editor Widget API
=================

Provides an API for extensions to create custom widgets that can be attached to specific lines in
the editor based on patterns. Extensions can define patterns with scan and render functions, and
the API will handle rendering and updating widgets as the editor content changes.

This API is not used on the actual Cohesion codebase, it was especially designed for extensions
*/

const EditorWidgetAPI = (() => {
	const DEFAULT_DEBOUNCE_MS = 140;

	const patterns = new Map();
	const widgetsByPattern = new Map();

	let refreshTimer = null;
	let lastEditor = null;
	let editorEventsBound = false;

	function resolveEditor() {
		const textarea = document.getElementById("editor");

		if (!textarea) {
			return null;
		}

		const wrapper = textarea.nextElementSibling;

		if (wrapper && wrapper.CodeMirror) {
			return wrapper.CodeMirror;
		}

		return null;
	}

	function clearWidgetList(widgets) {
		if (!Array.isArray(widgets)) {
			return;
		}

		for (const widget of widgets) {
			try {
				widget.clear();
			} catch {
				// Ignore stale widgets.
			}
		}
	}

	function clearWidgetsForPattern(patternId) {
		const widgets = widgetsByPattern.get(patternId);
		clearWidgetList(widgets);
		widgetsByPattern.delete(patternId);
	}

	function clearAllWidgets() {
		for (const widgets of widgetsByPattern.values()) {
			clearWidgetList(widgets);
		}

		widgetsByPattern.clear();
	}

	function normalizeRenderResult(result) {
		if (result instanceof HTMLElement) {
			return result;
		}

		const node = document.createElement("div");
		node.className = "widget-line";

		if (typeof result === "string") {
			node.textContent = result;
		} else {
			node.textContent = "";
		}

		return node;
	}

	function buildContext(cm) {
		const lineCount = cm.lineCount();
		const lines = [];

		for (let i = 0; i < lineCount; i += 1) {
			lines.push(cm.getLine(i));
		}

		return {
			editor: cm,
			lineCount,
			lines,
			text: lines.join("\n")
		};
	}

	function ensureEditorBindings() {
		const cm = resolveEditor();

		if (!cm) {
			return null;
		}

		if (cm !== lastEditor) {
			editorEventsBound = false;
			lastEditor = cm;
		}

		if (editorEventsBound) {
			return cm;
		}

		cm.on("change", () => {
			api.scheduleRefresh();
		});

		cm.on("swapDoc", () => {
			api.scheduleRefresh();
		});

		editorEventsBound = true;
		return cm;
	}

	function runPattern(patternId, pattern, context) {
		const cm = context.editor;
		const found = pattern.scan(context);

		if (!Array.isArray(found) || found.length === 0) {
			clearWidgetsForPattern(patternId);
			return;
		}

		const widgets = [];

		for (const item of found) {
			if (!item || typeof item.line !== "number") {
				continue;
			}

			if (item.line < 0 || item.line >= context.lineCount) {
				continue;
			}

			let rendered;

			try {
				rendered = pattern.render({
					...context,
					item,
					patternId,
					helpers: api.helpers
				});
			} catch (error) {
				console.error(`[Widget pattern render error] ${patternId}`, error);
				continue;
			}

			if (rendered === null || rendered === undefined) {
				continue;
			}

			const node = normalizeRenderResult(rendered);
			const widgetOptions = {
				coverGutter: false,
				noHScroll: false,
				above: false,
				...(pattern.options || {}),
				...(item.options || {})
			};

			const widget = cm.addLineWidget(item.line, node, widgetOptions);
			widgets.push(widget);
		}

		clearWidgetsForPattern(patternId);
		widgetsByPattern.set(patternId, widgets);
	}

	const api = {
		register(patternId, pattern) {
			if (typeof patternId !== "string" || patternId.trim() === "") {
				throw new Error("Pattern id must be a non-empty string.");
			}

			if (!pattern || typeof pattern.scan !== "function" || typeof pattern.render !== "function") {
				throw new Error("Pattern must define scan(context) and render(context)." );
			}

			patterns.set(patternId, pattern);
			this.refresh();

			return patternId;
		},

		unregister(patternId) {
			patterns.delete(patternId);
			clearWidgetsForPattern(patternId);
		},

		has(patternId) {
			return patterns.has(patternId);
		},

		list() {
			return Array.from(patterns.keys());
		},

		clearPatterns() {
			patterns.clear();
			clearAllWidgets();
		},

		refresh() {
			if (refreshTimer) {
				clearTimeout(refreshTimer);
				refreshTimer = null;
			}

			const cm = ensureEditorBindings();

			if (!cm || patterns.size === 0) {
				clearAllWidgets();
				return;
			}

			const context = buildContext(cm);

			cm.operation(() => {
				for (const [patternId, pattern] of patterns.entries()) {
					try {
						runPattern(patternId, pattern, context);
					} catch (error) {
						console.error(`[Widget pattern scan error] ${patternId}`, error);
						clearWidgetsForPattern(patternId);
					}
				}
			});
		},

		scheduleRefresh(delayMs = DEFAULT_DEBOUNCE_MS) {
			if (refreshTimer) {
				clearTimeout(refreshTimer);
			}

			refreshTimer = setTimeout(() => {
				refreshTimer = null;
				this.refresh();
			}, Math.max(0, Number(delayMs) || DEFAULT_DEBOUNCE_MS));
		},

		helpers: {
			createButton(label, onClick, className = "") {
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = `widget-button ${className}`.trim();
				btn.textContent = label;

				btn.addEventListener("click", (event) => {
					event.preventDefault();
					event.stopPropagation();
					onClick?.(event);
				});

				return btn;
			},

			createContainer(extraClass = "") {
				const node = document.createElement("div");
				node.className = `widget-line ${extraClass}`.trim();
				return node;
			},

			createMutedLabel(text) {
				const span = document.createElement("span");
				span.className = "widget-muted";
				span.textContent = text;
				return span;
			}
		}
	};

	return api;
})();

const WidgetPatternRegistry = EditorWidgetAPI;
