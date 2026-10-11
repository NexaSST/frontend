// Uncompressed ZIP keeps SVG files intact and avoids another browser dependency.
export interface ZipEntry { name: string; content: string }
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export function svgZip(entries: ZipEntry[]): Uint8Array<ArrayBuffer> {
  if (entries.length > 65535) throw new Error('O lote excede o limite de arquivos do ZIP.');
  const encoder = new TextEncoder();
  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const content = encoder.encode(entry.content);
    const crc = crc32(content);
    const header = new Uint8Array(30 + name.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x0800, true); // UTF-8 filenames.
    view.setUint16(12, 33, true); // 1980-01-01, valid DOS date.
    view.setUint32(14, crc, true);
    view.setUint32(18, content.length, true);
    view.setUint32(22, content.length, true);
    view.setUint16(26, name.length, true);
    header.set(name, 30);
    local.push(header, content);
    const directory = new Uint8Array(46 + name.length);
    const dir = new DataView(directory.buffer);
    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint16(8, 0x0800, true);
    dir.setUint16(14, 33, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, content.length, true);
    dir.setUint32(24, content.length, true);
    dir.setUint16(28, name.length, true);
    dir.setUint32(42, offset, true);
    directory.set(name, 46);
    central.push(directory);
    offset += header.length + content.length;
  }
  const size = central.reduce((sum, bytes) => sum + bytes.length, 0);
  if (offset + size + 22 > 0xffffffff) throw new Error('O lote excede o tamanho máximo do ZIP.');
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, entries.length, true);
  view.setUint16(10, entries.length, true);
  view.setUint32(12, size, true);
  view.setUint32(16, offset, true);
  const archive = new Uint8Array(offset + size + end.length);
  let position = 0;
  for (const bytes of [...local, ...central, end]) { archive.set(bytes, position); position += bytes.length; }
  return archive;
}
