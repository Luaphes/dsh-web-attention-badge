/**
 * dsh-web-attention-badge, browser half.
 *
 * Hand-written ModuleLoader bundle (no build step): registers one list entry
 * into the frame-wide `shell.overlay` slot — a small corner badge in the
 * top-left of the app frame. Two counts, driven entirely by the client
 * sessions store (`useSessions` standard hook on root-scope slots):
 *
 *   - sessions whose SessionSummary.pendingInteraction is set
 *     ('approval' | 'plan-review' | 'question')  →  amber pill, user input needed
 *   - sessions whose SessionSummary.completed is set (finished while not
 *     selected and not yet opened)               →  green pill, done reminder
 *
 * The same totals also prefix the browser tab title as "(N) " so attention
 * survives a background tab, and recolor the page favicon (the whale stays,
 * tinted amber when any session waits for input, green when only completed
 * reminders remain) — the favicon sits on the left side of the browser tab,
 * so the reminder is visible even when the tab title is truncated. Both
 * features are pure client-side; the badge is click-through
 * (pointer-events: none) so it never steals clicks from the sidebar brand /
 * collapse toggle underneath.
 */
window.__ModuleLoader__.load({
  id: "dsh-web-attention-badge",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var React = require("react");
    var jsxRuntime = require("react/jsx-runtime");

    /** Toggle the "(N) " browser tab title prefix (independent of the badge). */
    var TAB_TITLE_ENABLED = true;

    /** Toggle the whale-favicon recolor (amber/green by state; independent). */
    var FAVICON_ENABLED = true;

    /** Prefix this bundle currently owns in document.title ("" = none). */
    var tabPrefix = "";

    /** Favicon state: the <link> we wrote and the href to restore on zero/unload. */
    var faviconLink = null;
    var faviconOriginalHref = null;

    /** Cached /favicon.svg source (whale path); fetched once on first recolor. */
    var whaleSvgText = null;
    var whaleFetching = false;

    /** Latest recolor intent: color to apply and whether a badge is wanted. */
    var whaleWanted = false;
    var whaleColor = null;

    /** Hidden probe element used to resolve theme CSS variables to concrete colors. */
    var colorProbe = null;

    /** Required client services: the slots registry (provided by dsh-client-runtime). */
    var inject = ["slots"];

    /**
     * Plugin body: register the badge into `shell.overlay` whenever the slot
     * is declared (ui-layout owns its declaration; slots.inject defers until
     * the declaration exists and re-runs across declaration lifetimes).
     */
    function apply(ctx) {
      ctx.slots.inject("shell.overlay", () =>
        ctx.slots.register(
          {
            name: "shell.overlay",
            id: "attention-badge",
            order: 100000,
          },
          AttentionBadge,
        ),
      );
    }

    /**
     * The badge component. Root scope: the framework injects the
     * GlobalStandardProps seats — only `useSessions` is consumed.
     */
    function AttentionBadge(props) {
      var state = props.useSessions(identity);

      var inputCount = 0;
      var doneCount = 0;
      var ids = state.ids;
      for (var i = 0; i < ids.length; i += 1) {
        var row = state.byId[ids[i]];
        if (row === void 0) continue;
        if (row.pendingInteraction !== void 0) inputCount += 1;
        if (row.completed === true) doneCount += 1;
      }

      // Keep the tab title prefix in sync. The shell's SessionDocumentTitle
      // rewrites document.title on session-title changes; this effect re-runs
      // on the same store updates and re-applies after it (React runs
      // passive effects in tree order, and this subtree renders after it).
      React.useEffect(
        function () {
          if (typeof document === "undefined") return;
          var total = inputCount + doneCount;
          stripTabPrefix();
          if (TAB_TITLE_ENABLED) {
            var next = total > 0 ? "(" + total + ") " : "";
            if (next !== "") document.title = next + document.title;
            tabPrefix = next;
          }
          // Same state on the favicon: recolor the whale. Priority color:
          // amber when any session waits for input, green otherwise (then
          // total === doneCount, so the tint means completed reminders only).
          updateFavicon(total, inputCount);
          return function () {
            stripTabPrefix();
            restoreFavicon();
          };
        },
        [state],
      );

      var total = inputCount + doneCount;
      if (total === 0) return null;

      var labelParts = [];
      if (inputCount > 0) labelParts.push(inputCount + " session(s) waiting for input");
      if (doneCount > 0) labelParts.push(doneCount + " session(s) completed");
      var statusLabel = labelParts.join(", ");

      return jsxRuntime.jsx(
        "div",
        {
          role: "status",
          "aria-label": statusLabel,
          style: {
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 6,
            pointerEvents: "none",
            userSelect: "none",
          },
        },
        inputCount > 0 &&
          jsxRuntime.jsx(Pill, {
            count: inputCount,
            background: "var(--dsw-alias-state-warn-primary, #f7a600)",
            title: inputCount + " \u4e2a\u4f1a\u8bdd\u7b49\u5f85\u4f60\u7684\u8f93\u5165",
          }),
        doneCount > 0 &&
          jsxRuntime.jsx(Pill, {
            count: doneCount,
            background: "var(--dsw-alias-state-success-primary, #2fb26b)",
            title: doneCount + " \u4e2a\u4f1a\u8bdd\u5df2\u5b8c\u6210\uff0c\u672a\u6253\u5f00",
          }),
      );
    }

    /** One rounded count pill. */
    function Pill(props) {
      return jsxRuntime.jsx(
        "span",
        {
          "aria-hidden": true,
          title: props.title,
          style: {
            boxSizing: "border-box",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 18,
            height: 18,
            padding: "0 5px",
            borderRadius: 9,
            background: props.background,
            color: "#ffffff",
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            fontFamily: "inherit",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.28)",
          },
        },
        String(props.count),
      );
    }

    function identity(value) {
      return value;
    }

    /** Remove the prefix this bundle last wrote (no-op when absent). */
    function stripTabPrefix() {
      if (tabPrefix !== "" && typeof document !== "undefined" && document.title.indexOf(tabPrefix) === 0) {
        document.title = document.title.slice(tabPrefix.length);
      }
      tabPrefix = "";
    }

    /**
     * Recolor the whale favicon by attention state, or restore the original
     * favicon when nothing needs attention. The count itself rides the
     * "(N) " tab title prefix next to the icon.
     */
    function updateFavicon(total, inputCount) {
      if (typeof document === "undefined") return;
      if (!FAVICON_ENABLED || total <= 0) {
        whaleWanted = false;
        restoreFavicon();
        return;
      }
      whaleWanted = true;
      whaleColor = resolveThemeColor(
        inputCount > 0 ? "--dsw-alias-state-warn-primary" : "--dsw-alias-state-success-primary",
        inputCount > 0 ? "#f7a600" : "#2fb26b",
      );
      if (whaleSvgText !== null) {
        applyWhaleColor(whaleColor);
        return;
      }
      // First time: fetch the shell's own favicon so the recolor always
      // matches the deployed logo, then apply the latest requested color.
      if (whaleFetching) return;
      whaleFetching = true;
      fetch("/favicon.svg")
        .then(function (res) {
          return res.ok ? res.text() : null;
        })
        .then(function (text) {
          whaleFetching = false;
          if (text === null || text.indexOf("<svg") === -1) return;
          whaleSvgText = text;
          if (whaleWanted && whaleColor !== null) applyWhaleColor(whaleColor);
        })
        .catch(function () {
          whaleFetching = false;
        });
    }

    /** Recolor the cached whale SVG and point the favicon link at it. */
    function applyWhaleColor(color) {
      if (typeof document === "undefined") return;
      var dataUrl = "data:image/svg+xml," + encodeURIComponent(recolorSvg(whaleSvgText, color));
      var link = faviconLink;
      if (link === null) {
        link = document.querySelector('link[rel~="icon"]');
        faviconLink = link;
      }
      if (link === null) {
        link = document.createElement("link");
        link.setAttribute("rel", "icon");
        link.setAttribute("type", "image/svg+xml");
        document.head.appendChild(link);
        faviconLink = link;
      }
      if (faviconOriginalHref === null) faviconOriginalHref = link.getAttribute("href");
      if (link.getAttribute("href") !== dataUrl) link.setAttribute("href", dataUrl);
    }

    /** Put the original favicon back (created-by-us links are simply removed). */
    function restoreFavicon() {
      var link = faviconLink;
      if (link === null || typeof document === "undefined") return;
      if (faviconOriginalHref === null) {
        if (link.parentNode !== null) link.parentNode.removeChild(link);
      } else if (link.getAttribute("href") !== faviconOriginalHref) {
        link.setAttribute("href", faviconOriginalHref);
      }
      faviconLink = null;
      faviconOriginalHref = null;
    }

    /**
     * Produce a monochrome copy of the whale SVG in `color`: drop the theme
     * <style> block (its media query would fight the tint) and put an
     * explicit fill on every path.
     */
    function recolorSvg(svgText, color) {
      var out = svgText.replace(/<style[\s\S]*?<\/style>/g, "");
      out = out.replace(/<path\b[^>]*>/g, function (tag) {
        var clean = tag.replace(/\sfill=(?:"[^"]*"|'[^']*')/g, "");
        return clean.replace(/<path/, '<path fill="' + color + '"');
      });
      return out;
    }

    /**
     * Resolve a theme CSS variable to a concrete color via a hidden probe
     * element (computed style resolves nested var() chains across themes).
     */
    function resolveThemeColor(token, fallback) {
      if (typeof document === "undefined") return fallback;
      try {
        if (colorProbe === null || colorProbe.parentNode === null) {
          colorProbe = document.createElement("span");
          colorProbe.setAttribute("aria-hidden", "true");
          colorProbe.style.position = "absolute";
          colorProbe.style.visibility = "hidden";
          colorProbe.style.pointerEvents = "none";
          colorProbe.style.width = "0";
          colorProbe.style.height = "0";
          document.body.appendChild(colorProbe);
        }
        colorProbe.style.background = "var(" + token + ", " + fallback + ")";
        var resolved = getComputedStyle(colorProbe).backgroundColor;
        if (resolved === "transparent" || resolved === "rgba(0, 0, 0, 0)") return fallback;
        return resolved;
      } catch (err) {
        return fallback;
      }
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
