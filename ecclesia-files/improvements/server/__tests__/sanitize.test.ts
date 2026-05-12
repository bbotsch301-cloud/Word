import { describe, it, expect } from "vitest";
import { sanitizeHtml, sanitizePlainText } from "../sanitize";

describe("sanitizeHtml", () => {
  it("strips script tags entirely", () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = sanitizeHtml(dirty);

    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("alert");
    expect(clean).toContain("<p>Hello</p>");
  });

  it("strips onerror event handlers from tags", () => {
    const dirty = '<img src="x" onerror="alert(1)">';
    const clean = sanitizeHtml(dirty);

    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("alert");
  });

  it("strips javascript: protocol from href attributes", () => {
    const dirty = '<a href="javascript:alert(1)">click</a>';
    const clean = sanitizeHtml(dirty);

    expect(clean).not.toContain("javascript:");
  });

  it("strips iframe tags", () => {
    const dirty = '<iframe src="https://evil.com"></iframe><p>safe</p>';
    const clean = sanitizeHtml(dirty);

    expect(clean).not.toContain("<iframe");
    expect(clean).toContain("<p>safe</p>");
  });

  it("preserves bold tags", () => {
    const result = sanitizeHtml("<b>bold text</b>");
    expect(result).toBe("<b>bold text</b>");
  });

  it("preserves strong tags", () => {
    const result = sanitizeHtml("<strong>important</strong>");
    expect(result).toBe("<strong>important</strong>");
  });

  it("preserves italic tags (em and i)", () => {
    expect(sanitizeHtml("<em>emphasis</em>")).toBe("<em>emphasis</em>");
    expect(sanitizeHtml("<i>italic</i>")).toBe("<i>italic</i>");
  });

  it("preserves links with href attribute", () => {
    const input = '<a href="https://example.com">link</a>';
    const result = sanitizeHtml(input);

    expect(result).toContain("href=");
    expect(result).toContain("https://example.com");
    expect(result).toContain("<a ");
  });

  it("preserves link target and rel attributes", () => {
    const input = '<a href="https://example.com" target="_blank" rel="noopener">link</a>';
    const result = sanitizeHtml(input);

    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener"');
  });

  it("strips non-allowed attributes like onclick from links", () => {
    const input = '<a href="https://example.com" onclick="alert(1)">click</a>';
    const result = sanitizeHtml(input);

    expect(result).not.toContain("onclick");
    expect(result).toContain("href=");
  });

  it("preserves paragraph and line break tags", () => {
    const input = "<p>First paragraph</p><br><p>Second</p>";
    const result = sanitizeHtml(input);

    expect(result).toContain("<p>");
    expect(result).toContain("<br>");
  });

  it("preserves list tags (ul, ol, li)", () => {
    const input = "<ul><li>item 1</li><li>item 2</li></ul>";
    const result = sanitizeHtml(input);

    expect(result).toContain("<ul>");
    expect(result).toContain("<li>");
  });

  it("preserves heading tags (h1-h6)", () => {
    const input = "<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>";
    const result = sanitizeHtml(input);

    expect(result).toContain("<h1>");
    expect(result).toContain("<h2>");
    expect(result).toContain("<h3>");
  });

  it("preserves code and pre tags", () => {
    const input = "<pre><code>const x = 1;</code></pre>";
    const result = sanitizeHtml(input);

    expect(result).toContain("<pre>");
    expect(result).toContain("<code>");
  });

  it("preserves blockquote tags", () => {
    const result = sanitizeHtml("<blockquote>A wise saying</blockquote>");
    expect(result).toContain("<blockquote>");
  });

  it("strips style tags", () => {
    const dirty = '<style>body{display:none}</style><p>content</p>';
    const clean = sanitizeHtml(dirty);

    expect(clean).not.toContain("<style");
    expect(clean).toContain("<p>content</p>");
  });

  it("strips div and span tags (not in allowed list)", () => {
    const dirty = '<div><span class="evil">text</span></div>';
    const clean = sanitizeHtml(dirty);

    expect(clean).not.toContain("<div");
    expect(clean).not.toContain("<span");
    expect(clean).toContain("text");
  });

  it("handles empty string input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("handles nested malicious content", () => {
    const dirty = '<b>bold <script>alert("xss")</script> text</b>';
    const clean = sanitizeHtml(dirty);

    expect(clean).not.toContain("<script");
    expect(clean).toContain("<b>");
    expect(clean).toContain("bold");
    expect(clean).toContain("text");
  });
});

describe("sanitizePlainText", () => {
  it("strips all HTML tags and returns plain text", () => {
    const input = "<p>Hello <b>world</b></p>";
    expect(sanitizePlainText(input)).toBe("Hello world");
  });

  it("strips script tags and their content", () => {
    const input = 'Text<script>alert("xss")</script>More';
    const result = sanitizePlainText(input);

    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  });

  it("returns plain text unchanged", () => {
    expect(sanitizePlainText("just plain text")).toBe("just plain text");
  });

  it("handles empty string", () => {
    expect(sanitizePlainText("")).toBe("");
  });

  it("strips links but preserves link text", () => {
    const input = '<a href="https://example.com">click here</a>';
    const result = sanitizePlainText(input);

    expect(result).toBe("click here");
    expect(result).not.toContain("<a");
    expect(result).not.toContain("href");
  });

  it("strips all formatting from complex HTML", () => {
    const input = "<h1>Title</h1><p><strong>Bold</strong> and <em>italic</em></p>";
    const result = sanitizePlainText(input);

    expect(result).toBe("TitleBold and italic");
    expect(result).not.toContain("<");
  });
});
