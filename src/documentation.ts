import { readFile } from 'fs/promises';
import MarkdownIt from 'markdown-it';
import { join } from 'path';
import { Request, Response } from './resource.js';

export class Documentation {
  private renderer = new MarkdownIt();

  constructor(private folder: string) {}

  async get(_: Request, response: Response) {
    const text = String(await readFile(join(this.folder, 'README.md')));
    const html = this.renderer.render(text);

    response.writeHead(200);
    response.end(html);
  }
}
