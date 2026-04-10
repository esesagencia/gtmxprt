/**
 * HTML Slimming Utility
 * Reduces HTML size for LLM processing by removing irrelevant tags and attributes.
 */
export function slimHTML(html) {
    if (!html) return '';

    let slim = html;

    // 1. Remove <script> contents
    slim = slim.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '<!-- [script removed] -->');

    // 2. Remove <style> contents
    slim = slim.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '<!-- [style removed] -->');

    // 3. Simplify <svg> (keep only top-level tag and attributes, remove paths)
    slim = slim.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, (match) => {
        const openTag = match.match(/<svg\b[^>]*>/i);
        return openTag ? `${openTag[0]}<!-- [svg paths removed] --></svg>` : '<!-- [svg removed] -->';
    });

    // 4. Remove comments
    slim = slim.replace(/<!--[\s\S]*?-->/g, '');

    // 5. Remove base64 images
    slim = slim.replace(/src="data:image\/[^;]+;base64,[^"]+"/gi, 'src="[base64 image removed]"');

    // 6. Condense whitespace
    slim = slim.replace(/\s+/g, ' ');

    return slim.trim();
}
