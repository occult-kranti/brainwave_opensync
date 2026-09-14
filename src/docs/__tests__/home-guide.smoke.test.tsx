/**
 * W8 smoke test: Home and Guide server-render without throwing and emit the
 * required honesty strings. Run: `npm test`.
 */
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import Home from '@/pages/Home';
import Guide from '@/pages/Guide';

function render(el: React.ReactElement) {
  return renderToString(<MemoryRouter>{el}</MemoryRouter>);
}

describe('W8 home & docs screens', () => {
  it('Home renders practical task paths, scope statement, and a complete directory', () => {
    const html = render(<Home />);
    expect(html).toContain('Listen, create, and inspect audio.');
    expect(html).toContain('Choose a sound');
    expect(html).toContain('They do not measure your brain activity.');
    expect(html).toContain('Build a chord');
    expect(html).toContain('Find a tool or page');
    expect(html).toContain('Theory &amp; research');
    expect(html).not.toContain('<canvas');
    expect(html).not.toContain('LOWEST GRADE');
  });

  it('Guide renders both registers control, module groups, and plot explainers', () => {
    const html = render(<Guide />);
    expect(html).toContain('SIMPLE');
    expect(html).toContain('DEEP TECHNICAL');
    expect(html).toContain('HOW TO USE');
    expect(html).toContain('READING THE PLOT');
    expect(html).toContain('Binaural engine');
    expect(html).toContain('Sound dose gauge');
  });
});
