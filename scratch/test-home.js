async function main() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  
  // Look for section headings
  console.log('--- Page check ---');
  const sections = html.split('<section');
  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i];
    const headingMatch = sec.match(/<h2[^>]*>([^<]+)<\/h2>/);
    console.log('\n=== SECTION:', headingMatch ? headingMatch[1] : 'Unknown');
    
    // Find event links
    const eventLinks = [...sec.matchAll(/href="\/events\/([^"]+)"/g)].map(m => m[1]);
    console.log('Event links count:', eventLinks.length);
    console.log('Event links:', eventLinks.slice(0, 6));
    
    // Find team names or titles
    const spans = [...sec.matchAll(/class="truncate text-xs font-semibold text-ink-100 group-hover:text-white">([^<]+)<\/span>/g)].map(m => m[1]);
    if (spans.length > 0) {
      console.log('Teams:', spans.slice(0, 8));
    }
    const h3s = [...sec.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map(m => m[1]);
    if (h3s.length > 0) {
      console.log('H3 titles:', h3s.slice(0, 6));
    }
  }
}
main().catch(console.error);
