import { readFile } from 'fs/promises';
import MarkdownIt from 'markdown-it';
import { join } from 'path';
import { Request, Response, Resource } from './resource.js';

export class Documentation extends Resource {
  private renderer = new MarkdownIt();

  constructor(private folder: string) {
    super();
  }

  async get(_: Request, response: Response) {
    const text = String(await readFile(join(this.folder, 'README.md')));
    const html = this.renderer.render(text);

    response.setHeader('Content-Type', 'text/html');
    response.writeHead(200);
    response.end(`
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://unpkg.com/@tailwindcss/typography@0.5.0/dist/typography.min.css" />
    <article class="prose lg:prose-xl m-auto py-12 px-6">
    ${html}
    </article>
    `);
  }
}
