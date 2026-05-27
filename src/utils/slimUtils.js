export function slimHTML(html) {
    if (!html) return "";
    let s = html;
    s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    s = s.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    s = s.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "<svg><!--svg--></svg>");
    s = s.replace(/<!--[\s\S]*?-->/g, "");
    s = s.replace(/src="data:image\/[^;]+;base64,[^"]+"/gi, 'src="[img]"');
    s = s.replace(/\bon[a-z]+="[^"]*"/gi, "");
    s = s.replace(/\bdata-(?!track)[a-z-]+="[^"]*"/gi, "");
    s = s.replace(/\s+/g, " ");
    return s.trim();
}
